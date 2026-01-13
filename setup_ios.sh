#!/bin/bash

# Use Homebrew Ruby
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export PATH="$HOME/.gem/ruby/3.4.0/bin:$PATH"
export GEM_HOME="$HOME/.gem"

echo "🔧 Setting up iOS dependencies..."
echo ""

cd ios

# Use the gem-installed pod
$HOME/.gem/ruby/3.4.0/bin/pod install

cd ..

echo ""
echo "✅ iOS setup complete!"
echo ""
echo "To run the app, use: npm run ios"
