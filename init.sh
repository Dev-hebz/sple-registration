#!/bin/bash

# SPLE Kuwait Registration - Quick Setup Script
# Developed by Godmisoft

echo "========================================="
echo "SPLE Kuwait Registration - Quick Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"

# Check if Git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install Git first."
    echo "Visit: https://git-scm.com/"
    exit 1
fi

echo "✅ Git detected: $(git --version)"
echo ""

# Initialize Git if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. 🔥 Firebase Setup:"
echo "   - Go to https://console.firebase.google.com/"
echo "   - Create a new project"
echo "   - Enable Firestore, Storage, and Authentication"
echo "   - Copy your Firebase config to js/app.js"
echo ""
echo "2. 📝 Update Firebase Config:"
echo "   - Edit: js/app.js"
echo "   - Replace firebaseConfig with your actual config"
echo ""
echo "3. 🚀 Deploy to GitHub:"
echo "   git add ."
echo "   git commit -m \"Initial commit\""
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git push -u origin main"
echo ""
echo "4. 🌐 Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Deploy!"
echo ""
echo "5. 🔐 Create Admin User:"
echo "   - In Firebase Console → Authentication"
echo "   - Add a user with email/password"
echo ""
echo "========================================="
echo "For detailed instructions, see:"
echo "- README.md"
echo "- DEPLOYMENT.md"
echo "========================================="
echo ""
echo "✨ Ready to build! Good luck!"
echo ""
