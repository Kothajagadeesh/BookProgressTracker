#!/bin/bash

# Use Homebrew Ruby instead of system Ruby
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export GEM_HOME="$HOME/.gem"
export GEM_PATH="$GEM_HOME"

echo "Installing CocoaPods..."
gem install cocoapods --user-install

echo ""
echo "Installing iOS dependencies..."
cd ios
pod install
cd ..

echo ""
echo "✅ Setup complete! You can now run: npm run ios"
