#!/bin/sh
# Dumps all project code to a single file for LLM context
# Respects .gitignore patterns
# Output: docs/llm/dump.txt

set -e

OUTPUT_DIR="docs/llm"
OUTPUT_FILE="$OUTPUT_DIR/dump.txt"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Clear/create output file
> "$OUTPUT_FILE"

echo "Dumping project code to $OUTPUT_FILE..."

# Use git ls-files to get tracked files (respects .gitignore)
# Falls back to find if not a git repo
if git rev-parse --git-dir > /dev/null 2>&1; then
    FILES=$(git ls-files --cached --others --exclude-standard 2>/dev/null)
else
    echo "Warning: Not a git repository, using find (may include ignored files)"
    FILES=$(find . -type f \
        ! -path './node_modules/*' \
        ! -path './dist/*' \
        ! -path './.git/*' \
        ! -path './docs/llm/*' \
        ! -name '*.lock' \
        ! -name 'package-lock.json' \
        | sed 's|^\./||')
fi

# File extensions to include
is_code_file() {
    case "$1" in
        *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) return 0 ;;
        *.css|*.scss|*.less) return 0 ;;
        *.html|*.htm) return 0 ;;
        *.json) return 0 ;;
        *.md|*.txt) return 0 ;;
        *.sh) return 0 ;;
        *.yaml|*.yml) return 0 ;;
        *.toml) return 0 ;;
        *.svg) return 0 ;;
        *) return 1 ;;
    esac
}

# Skip certain files
should_skip() {
    case "$1" in
        package-lock.json|pnpm-lock.yaml|yarn.lock) return 0 ;;
        *.min.js|*.min.css) return 0 ;;
        docs/llm/*) return 0 ;;
        *) return 1 ;;
    esac
}

count=0

echo "$FILES" | while IFS= read -r file; do
    # Skip empty lines
    [ -z "$file" ] && continue
    
    # Skip if not a regular file
    [ ! -f "$file" ] && continue
    
    # Skip non-code files
    is_code_file "$file" || continue
    
    # Skip certain files
    should_skip "$file" && continue
    
    # Get file size
    size=$(wc -c < "$file" | tr -d ' ')
    
    # Skip files larger than 100KB
    [ "$size" -gt 102400 ] && continue
    
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "FILE: $file" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    count=$((count + 1))
done

# Count files (recount since subshell)
file_count=$(grep -c "^FILE:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
total_size=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')

echo "Done! Dumped $file_count files ($total_size bytes) to $OUTPUT_FILE"
