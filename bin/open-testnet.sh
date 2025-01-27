#!/bin/bash

# List of URLs to open in the browser, e.g., pointing to different containers
urls=(
  "https://explorer.hiro.so/address/ST3RR3HF25CQ9A5DEWS4R1WKJSBCFKQXFBYPJK3WV?chain=testnet" # pox-4
  # Add more URLs as needed
)

# Function to open URLs in the default browser
open_url() {
  local url=$1
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$url"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    open "$url"
  elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start "$url"
  else
    echo "Unsupported OS: $OSTYPE"
  fi
}

# Loop through the URLs and open each one in a new browser tab
for url in "${urls[@]}"; do
  echo "Opening $url"
  open_url "$url"
done
