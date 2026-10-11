// The terminal version. All the real work lives in lib.rs, which the
// browser uses too. This file just reads a file and prints the JSON.
use std::env;
use std::fs;

fn main() {
    // `cargo run -- my_chat.txt` reads my_chat.txt. Plain `cargo run` reads chat.txt.
    let path = env::args().nth(1).unwrap_or("chat.txt".to_string());
    let text = fs::read_to_string(&path).expect("Failed to read file");

    // `wrapped` is this project's own library (lib.rs), like importing from "./lib"
    let stats = wrapped::analyze(&text);

    // Pretty-printed JSON: exactly what React will receive
    let json = serde_json::to_string_pretty(&stats).expect("Stats can always be turned into JSON");
    println!("{}", json);
}
