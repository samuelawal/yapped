use chrono::{Datelike, NaiveDate};
use serde::Serialize;
use std::collections::HashMap;
use std::hash::Hash;
use wasm_bindgen::prelude::*;

// ===================== Parsing =====================

#[derive(Debug)]
struct Message {
    date: NaiveDate,
    hour: u32, // 0-23, already converted from 12-hour time if needed
    minute: u32,
    sender: String,
    text: String,
    is_media: bool,
}

// A message before we know if its date is day/month or month/day.
// We can only tell after looking at the whole chat.
struct RawMessage {
    date_parts: (u32, u32, i32), // (first number, second number, year)
    hour: u32,
    minute: u32,
    sender: String,
    text: String,
    is_media: bool,
}

// Invisible characters WhatsApp sometimes adds: a byte-order mark at the
// start of the file, and a left-to-right mark in iPhone exports.
const INVISIBLE: [char; 2] = ['\u{feff}', '\u{200e}'];

// Splits a line into (date, (hour, minute), rest) for both export formats:
//   Android: 12/03/2024, 14:05 - Samuel: Hi
//   iPhone:  [12/03/2024, 14:05:33] Samuel: Hi
// Returns None if the line doesn't start with a valid timestamp,
// which means it's the next line of a multi-line message.
fn split_header(line: &str) -> Option<((u32, u32, i32), (u32, u32), &str)> {
    let line = line.trim_start_matches(INVISIBLE);
    let (stamp, rest) = match line.strip_prefix('[') {
        Some(after_bracket) => after_bracket.split_once("] ")?, // iPhone
        None => line.split_once(" - ")?,                        // Android
    };
    let (date, time) = stamp.split_once(", ")?;
    Some((parse_date_parts(date)?, parse_time(time)?, rest))
}

// "12/03/2024" or "12/03/24" -> (12, 3, 2024)
fn parse_date_parts(date: &str) -> Option<(u32, u32, i32)> {
    let parts: Vec<&str> = date.split(['/', '.', '-']).collect();
    if parts.len() != 3 {
        return None;
    }
    // .ok() turns a Result into an Option, so `?` can use it here
    let first = parts[0].parse().ok()?;
    let second = parts[1].parse().ok()?;
    let mut year: i32 = parts[2].parse().ok()?;
    if year < 100 {
        year += 2000;
    }
    Some((first, second, year))
}

// "14:05", "14:05:33", "2:05 pm" or "2:05:33 PM" -> (14, 5)
fn parse_time(time: &str) -> Option<(u32, u32)> {
    // Newer exports put a special narrow space before AM/PM. Make it a normal one.
    let time = time.replace(['\u{202f}', '\u{a0}'], " ").to_lowercase();
    let is_pm = time.ends_with("pm");
    let is_am = time.ends_with("am");
    let clock = time.trim_end_matches(|c: char| c.is_alphabetic() || c == ' ');

    let mut parts = clock.split(':');
    let mut hour: u32 = parts.next()?.parse().ok()?;
    let minute: u32 = parts.next()?.parse().ok()?;
    if minute > 59 {
        return None;
    }
    if is_pm && hour < 12 {
        hour += 12;
    }
    if is_am && hour == 12 {
        hour = 0;
    }
    if hour > 23 {
        None
    } else {
        Some((hour, minute))
    }
}

fn parse_chat(text: &str) -> Vec<Message> {
    let mut raws: Vec<RawMessage> = Vec::new();
    // Was the last timestamped line a real message? (Not a system message.)
    let mut in_message = false;

    for line in text.lines() {
        match split_header(line) {
            Some((date_parts, (hour, minute), rest)) => {
                in_message = false;

                // System messages like "Samuel added Tobi" have no "Name: " part.
                // let-else: if the pattern doesn't match, run the else block.
                let Some((sender, text)) = rest.split_once(": ") else {
                    continue;
                };

                // iPhone marks media and system messages with an invisible character.
                let marked = text.starts_with('\u{200e}');
                let text = text.trim_start_matches(INVISIBLE);
                let is_media = text == "<Media omitted>"
                    || (marked && (text.ends_with(" omitted") || text.starts_with("<attached:")));
                if marked && !is_media {
                    continue; // iPhone system message, e.g. "Samuel changed the group name"
                }

                raws.push(RawMessage {
                    date_parts,
                    hour,
                    minute,
                    sender: sender.to_string(),
                    text: text.to_string(),
                    is_media,
                });
                in_message = true;
            }
            None => {
                // No timestamp, so this line belongs to the previous message.
                if in_message {
                    if let Some(last) = raws.last_mut() {
                        last.text.push('\n');
                        last.text.push_str(line);
                    }
                }
            }
        }
    }

    // Phones write dates as day/month or month/day depending on region.
    // If any first number is over 12, it must be a day. Otherwise, if any
    // second number is over 12, the month comes first. Default: day first.
    let month_first =
        !raws.iter().any(|m| m.date_parts.0 > 12) && raws.iter().any(|m| m.date_parts.1 > 12);

    let mut messages = Vec::new();
    for raw in raws {
        let (first, second, year) = raw.date_parts;
        let (day, month) = if month_first {
            (second, first)
        } else {
            (first, second)
        };
        // from_ymd_opt returns None for impossible dates like 31/02
        if let Some(date) = NaiveDate::from_ymd_opt(year, month, day) {
            messages.push(Message {
                date,
                hour: raw.hour,
                minute: raw.minute,
                sender: raw.sender,
                text: raw.text,
                is_media: raw.is_media,
            });
        }
    }
    messages
}

// ===================== Stats =====================

// These structs are what the browser receives as JSON.
// #[derive(Serialize)] is like #[derive(Debug)], but writes the code
// that turns the struct into JSON (with the serde library).
// rename_all = "camelCase" turns `total_messages` into `totalMessages`
// so the JSON looks normal to JavaScript.

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub total_messages: u32,
    pub first_date: Option<String>, // Option becomes `null` in JSON when None
    pub last_date: Option<String>,
    pub leaderboard: Vec<PersonCount>,
    pub busiest_hour: Option<HourCount>,
    pub media: Vec<PersonCount>,
    pub top_emojis: Vec<EmojiCount>,
    pub most_active_day: Option<DayCount>,
    pub longest_streak: Streak,
    pub night_owl: Option<PersonCount>,
    pub fastest_replier: Option<Replier>,
}

#[derive(Serialize, Debug)]
pub struct PersonCount {
    pub name: String,
    pub count: u32,
}

#[derive(Serialize, Debug)]
pub struct HourCount {
    pub hour: u32,
    pub count: u32,
}

#[derive(Serialize, Debug)]
pub struct EmojiCount {
    pub emoji: String,
    pub count: u32,
}

#[derive(Serialize, Debug)]
pub struct DayCount {
    pub date: String, // "2024-03-12"
    pub count: u32,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Replier {
    pub name: String,
    pub typical_minutes: f64, // the median reply time
    pub replies: u32,
}

#[derive(Serialize, Debug)]
pub struct Streak {
    pub days: u32,
    pub start: Option<String>,
    pub end: Option<String>,
}

// Turns a map of counts into a list sorted biggest first.
// Ties are sorted by key, so the order is the same on every run.
// <K: Ord + Hash> is a generic, like <K> in TypeScript: K can be any type
// that can be sorted (Ord) and used as a map key (Hash), so this one function
// works for names, hours and dates.
fn sort_counts<K: Ord + Hash>(counts: HashMap<K, u32>) -> Vec<(K, u32)> {
    let mut board: Vec<_> = counts.into_iter().collect();
    board.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
    board
}

// A char is one Unicode character. `as u32` gives its code number,
// and emojis live in a few known number ranges.
fn is_emoji(c: char) -> bool {
    let code = c as u32;
    let is_skin_tone = (0x1F3FB..=0x1F3FF).contains(&code);
    let in_emoji_range = (0x1F300..=0x1FAFF).contains(&code) || (0x2600..=0x27BF).contains(&code);
    in_emoji_range && !is_skin_tone
}

// `pub` means other files can use this, like `export` in JS.
pub fn analyze(text: &str) -> Stats {
    let messages = parse_chat(text);

    // Leaderboard, media and night owl all count messages per person
    let mut sender_counts = HashMap::new();
    let mut media_counts = HashMap::new();
    let mut night_counts = HashMap::new();
    let mut hour_counts = HashMap::new();
    let mut emoji_counts = HashMap::new();
    let mut day_counts = HashMap::new();

    // One loop that fills every map, instead of one loop per stat
    for message in &messages {
        *sender_counts.entry(message.sender.clone()).or_insert(0) += 1;
        *hour_counts.entry(message.hour).or_insert(0) += 1;
        *day_counts.entry(message.date).or_insert(0) += 1;

        if message.is_media {
            *media_counts.entry(message.sender.clone()).or_insert(0) += 1;
        }
        if message.hour < 4 {
            *night_counts.entry(message.sender.clone()).or_insert(0) += 1;
        }
        // .chars() loops over each character, like [...text] in JS
        for c in message.text.chars() {
            if is_emoji(c) {
                *emoji_counts.entry(c.to_string()).or_insert(0) += 1;
            }
        }
    }

    // Turns sorted (name, count) pairs into PersonCount structs.
    // .map() and .collect() work like JS .map() on an array.
    let to_people = |board: Vec<(String, u32)>| -> Vec<PersonCount> {
        board
            .into_iter()
            .map(|(name, count)| PersonCount { name, count })
            .collect()
    };

    // Unique days in order, for the date range and the streak
    let mut days: Vec<NaiveDate> = day_counts.keys().copied().collect();
    days.sort();

    Stats {
        total_messages: messages.len() as u32,
        first_date: days.first().map(|d| d.to_string()),
        last_date: days.last().map(|d| d.to_string()),
        leaderboard: to_people(sort_counts(sender_counts)),
        busiest_hour: sort_counts(hour_counts)
            .first()
            .map(|&(hour, count)| HourCount { hour, count }),
        media: to_people(sort_counts(media_counts)),
        top_emojis: sort_counts(emoji_counts)
            .into_iter()
            .take(5)
            .map(|(emoji, count)| EmojiCount { emoji, count })
            .collect(),
        most_active_day: sort_counts(day_counts)
            .first()
            .map(|(date, count)| DayCount {
                date: date.to_string(),
                count: *count,
            }),
        longest_streak: longest_streak(&days),
        night_owl: to_people(sort_counts(night_counts)).into_iter().next(),
        fastest_replier: fastest_replier(&messages),
    }
}

// Minutes since year 1, so we can subtract two messages' times
// even when they're on different days.
fn minutes_since_start(message: &Message) -> i64 {
    message.date.num_days_from_ce() as i64 * 24 * 60
        + message.hour as i64 * 60
        + message.minute as i64
}

// A "reply" is a message from a different person than the one before it,
// sent within 6 hours. Longer gaps are a new conversation, not a reply.
// The fastest replier has the lowest *median* reply time (minimum 3 replies).
// The median is the middle value, so one slow reply after a long silence
// doesn't ruin someone's score the way it would with an average.
fn fastest_replier(messages: &[Message]) -> Option<Replier> {
    const MAX_GAP_MINUTES: i64 = 6 * 60;
    const MIN_REPLIES: u32 = 3;

    // name -> every reply time, in minutes
    let mut reply_times: HashMap<String, Vec<i64>> = HashMap::new();
    // .windows(2) gives every pair of neighbours: [a, b], [b, c], [c, d]...
    for pair in messages.windows(2) {
        let (previous, reply) = (&pair[0], &pair[1]);
        if previous.sender == reply.sender {
            continue;
        }
        let gap = minutes_since_start(reply) - minutes_since_start(previous);
        if (0..=MAX_GAP_MINUTES).contains(&gap) {
            reply_times
                .entry(reply.sender.clone())
                .or_default()
                .push(gap);
        }
    }

    let mut repliers: Vec<Replier> = reply_times
        .into_iter()
        .filter(|(_, times)| times.len() as u32 >= MIN_REPLIES)
        .map(|(name, times)| Replier {
            name,
            // Read the length first: median() takes ownership of `times`
            replies: times.len() as u32,
            typical_minutes: median(times),
        })
        .collect();
    // f64 uses total_cmp instead of cmp, because decimals can be NaN
    repliers.sort_by(|a, b| {
        a.typical_minutes
            .total_cmp(&b.typical_minutes)
            .then(a.name.cmp(&b.name))
    });
    repliers.into_iter().next()
}

// The middle value once sorted (or the average of the two middle values)
fn median(mut values: Vec<i64>) -> f64 {
    values.sort();
    let mid = values.len() / 2;
    if values.len() % 2 == 0 {
        (values[mid - 1] + values[mid]) as f64 / 2.0
    } else {
        values[mid] as f64
    }
}

// `days` must be sorted with no duplicates
fn longest_streak(days: &[NaiveDate]) -> Streak {
    let mut best = Streak {
        days: 0,
        start: None,
        end: None,
    };
    let mut current = 0;
    for i in 0..days.len() {
        // succ_opt() = the day after
        if i > 0 && days[i - 1].succ_opt() == Some(days[i]) {
            current += 1;
        } else {
            current = 1;
        }
        if current > best.days {
            best.days = current;
            best.start = Some(days[i + 1 - current as usize].to_string());
            best.end = Some(days[i].to_string());
        }
    }
    best
}

// ===================== The door to JavaScript =====================

// #[wasm_bindgen] makes this function callable from JavaScript.
// In JS it becomes: analyzeChat(text: string): string
#[wasm_bindgen(js_name = analyzeChat)]
pub fn analyze_chat(text: &str) -> String {
    // serde_json::to_string is Rust's JSON.stringify
    serde_json::to_string(&analyze(text)).expect("Stats can always be turned into JSON")
}

// ===================== Tests =====================

// Tests run with `cargo test`, like `npm test` with Jest.
// #[cfg(test)] means this code is only compiled when testing.
#[cfg(test)]
mod tests {
    use super::*; // bring in everything from the file above

    #[test]
    fn parses_android_line() {
        let messages = parse_chat("12/03/2024, 14:05 - Samuel: Who's coming tonight?");
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].sender, "Samuel");
        assert_eq!(messages[0].text, "Who's coming tonight?");
        assert_eq!(messages[0].hour, 14);
        assert_eq!(
            messages[0].date,
            NaiveDate::from_ymd_opt(2024, 3, 12).unwrap()
        );
    }

    #[test]
    fn parses_iphone_line_with_12_hour_time() {
        let messages = parse_chat("[12/03/2024, 2:05:33\u{202f}PM] Samuel: Hi");
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].hour, 14);
        assert_eq!(messages[0].text, "Hi");
    }

    #[test]
    fn joins_multi_line_messages() {
        let chat = "12/03/2024, 14:05 - Samuel: Line one\nLine two\n12/03/2024, 14:06 - Tobi: Hi";
        let messages = parse_chat(chat);
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0].text, "Line one\nLine two");
    }

    #[test]
    fn skips_system_messages() {
        let chat = "12/03/2024, 14:00 - Samuel added Tobi\n\
                    [12/03/2024, 14:01:00] Group: \u{200e}Samuel changed the group name\n\
                    12/03/2024, 14:05 - Samuel: Hi";
        let messages = parse_chat(chat);
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0].text, "Hi");
    }

    #[test]
    fn detects_media() {
        let chat = "12/03/2024, 14:05 - Tobi: <Media omitted>\n\
                    \u{200e}[12/03/2024, 14:06:00] Tobi: \u{200e}image omitted";
        let messages = parse_chat(chat);
        assert_eq!(messages.len(), 2);
        assert!(messages[0].is_media);
        assert!(messages[1].is_media);
    }

    #[test]
    fn detects_month_first_dates() {
        let messages = parse_chat("03/25/2024, 09:00 - Samuel: Hi");
        assert_eq!(
            messages[0].date,
            NaiveDate::from_ymd_opt(2024, 3, 25).unwrap()
        );
    }

    #[test]
    fn finds_longest_streak_with_dates() {
        let chat = "01/03/2024, 10:00 - A: hi\n\
                    05/03/2024, 10:00 - A: hi\n\
                    06/03/2024, 10:00 - A: hi\n\
                    07/03/2024, 10:00 - A: hi\n\
                    09/03/2024, 10:00 - A: hi";
        let streak = analyze(chat).longest_streak;
        assert_eq!(streak.days, 3);
        assert_eq!(streak.start.as_deref(), Some("2024-03-05"));
        assert_eq!(streak.end.as_deref(), Some("2024-03-07"));
    }

    #[test]
    fn finds_fastest_replier() {
        // Tobi replies after 1 minute each time, Samuel after 10.
        // The 2-day gap at the end is too long to count as a reply.
        let chat = "01/03/2024, 10:00 - Samuel: a\n\
                    01/03/2024, 10:01 - Tobi: b\n\
                    01/03/2024, 10:11 - Samuel: c\n\
                    01/03/2024, 10:12 - Tobi: d\n\
                    01/03/2024, 10:22 - Samuel: e\n\
                    01/03/2024, 10:23 - Tobi: f\n\
                    01/03/2024, 10:33 - Samuel: g\n\
                    03/03/2024, 10:00 - Tobi: h";
        let replier = analyze(chat).fastest_replier.unwrap();
        assert_eq!(replier.name, "Tobi");
        assert_eq!(replier.replies, 3);
        assert_eq!(replier.typical_minutes, 1.0);
    }

    #[test]
    fn empty_chat_does_not_crash() {
        let json = analyze_chat("");
        assert!(json.contains("\"totalMessages\":0"));
        assert!(json.contains("\"busiestHour\":null"));
    }
}
