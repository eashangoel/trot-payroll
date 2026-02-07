# Git Commands Quick Reference

## 🚀 First Time Setup

If you haven't pushed to GitHub yet:

```bash
cd /Users/eashangoel/Desktop/trot-payroll

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Restaurant Payroll Automation v1.0"

# Add remote repository
git remote add origin git@github.com:eashangoel/trot-payroll.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 📝 Daily Workflow

### Making Changes

```bash
# Check what files changed
git status

# See what changed in files
git diff

# Add specific files
git add src/components/FileUpload.jsx

# Or add all changed files
git add .

# Commit with a message
git commit -m "Add download sample button to file upload"

# Push to GitHub
git push
```

---

## 🔄 Common Git Commands

### Check Status
```bash
git status                    # See what's changed
git log --oneline            # See commit history
git branch                   # See current branch
```

### Add & Commit
```bash
git add .                    # Add all changes
git add filename.js          # Add specific file
git commit -m "message"      # Commit with message
git commit -am "message"     # Add & commit tracked files
```

### Push & Pull
```bash
git push                     # Push to GitHub
git pull                     # Pull latest from GitHub
git push origin main         # Push to main branch
```

### Undo Changes
```bash
git checkout -- filename.js  # Discard changes in file
git reset HEAD filename.js   # Unstage file
git reset --soft HEAD~1      # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (discard changes)
```

### Branches
```bash
git branch feature-name      # Create new branch
git checkout feature-name    # Switch to branch
git checkout -b feature-name # Create and switch
git merge feature-name       # Merge branch into current
git branch -d feature-name   # Delete branch
```

---

## 📦 Useful Commit Message Examples

```bash
git commit -m "Initial commit - Restaurant Payroll Automation v1.0"
git commit -m "Add download sample CSV button to file upload"
git commit -m "Fix calculation bug for overtime hours"
git commit -m "Update README with deployment instructions"
git commit -m "Improve PDF payslip formatting"
git commit -m "Add validation for employee names"
git commit -m "Update dependencies to latest versions"
```

---

## 🔍 Check Remote Repository

```bash
git remote -v                # Show remote URLs
git remote show origin       # Show remote details
```

Should show:
```
origin  git@github.com:eashangoel/trot-payroll.git (fetch)
origin  git@github.com:eashangoel/trot-payroll.git (push)
```

---

## 🌿 Feature Branch Workflow

When adding a new feature:

```bash
# Create and switch to feature branch
git checkout -b feature/sample-download

# Make your changes...
# Add and commit
git add .
git commit -m "Add sample file download feature"

# Push feature branch
git push -u origin feature/sample-download

# Switch back to main
git checkout main

# Merge feature (after testing)
git merge feature/sample-download

# Push to main
git push

# Delete feature branch (optional)
git branch -d feature/sample-download
```

---

## 🆘 Common Issues & Fixes

### Issue: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin git@github.com:eashangoel/trot-payroll.git
```

### Issue: "Updates were rejected because the tip of your current branch is behind"
```bash
git pull --rebase origin main
git push
```

### Issue: "Permission denied (publickey)"
```bash
# Check SSH key
ssh -T git@github.com

# If needed, add SSH key to GitHub:
# 1. Generate key: ssh-keygen -t ed25519 -C "your_email@example.com"
# 2. Copy key: cat ~/.ssh/id_ed25519.pub
# 3. Add to GitHub: Settings → SSH and GPG keys → New SSH key
```

### Issue: Accidentally committed large files
```bash
# Remove from staging
git reset HEAD large-file.zip

# Add to .gitignore
echo "large-file.zip" >> .gitignore

# Commit
git add .gitignore
git commit -m "Add large file to gitignore"
```

---

## 📊 View Changes

```bash
# See what changed in last commit
git show

# See changes in specific file
git log -p filename.js

# See who changed what
git blame filename.js

# See changes between commits
git diff commit1 commit2
```

---

## 🏷️ Tags & Releases

```bash
# Create a tag for version
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"

# Push tag to GitHub
git push origin v1.0.0

# List all tags
git tag

# Create release on GitHub
# Go to: https://github.com/eashangoel/trot-payroll/releases
# Click "Create a new release"
```

---

## 🔐 .gitignore

Your `.gitignore` already includes:
- `node_modules/` - Dependencies (don't commit)
- `dist/` - Build output (don't commit)
- `.env` - Environment variables (don't commit)
- `.DS_Store` - Mac system files (don't commit)

To add more:
```bash
echo "filename.txt" >> .gitignore
git add .gitignore
git commit -m "Update gitignore"
```

---

## 💡 Pro Tips

1. **Commit often** - Small, focused commits are better
2. **Write clear messages** - Future you will thank you
3. **Pull before push** - Avoid conflicts
4. **Use branches** - Keep main stable
5. **Review before commit** - Use `git diff` to check changes

---

## 🎯 Quick Reference Card

| Command | What it does |
|---------|-------------|
| `git status` | Check what's changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push` | Push to GitHub |
| `git pull` | Pull from GitHub |
| `git log` | See commit history |
| `git diff` | See changes |
| `git checkout -b name` | Create new branch |

---

**Repository:** https://github.com/eashangoel/trot-payroll  
**Username:** eashangoel
