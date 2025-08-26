import os

# Folders & files we want to include
INCLUDE_FOLDERS = ["src", "prisma"]
INCLUDE_FILES = [
    "package.json", "next.config.js", "next.config.ts",
    "tailwind.config.js", "tsconfig.json"
]

# Excluded folders
EXCLUDE_FOLDERS = {"node_modules", ".next", ".vscode", "public"}

# Max characters per output file (to avoid GPT cutoffs)
MAX_CHARS = 40000  

def should_include(file_path):
    parts = file_path.split(os.sep)
    if any(part in EXCLUDE_FOLDERS for part in parts):
        return False
    if os.path.basename(file_path) in INCLUDE_FILES:
        return True
    if any(parts[0] == folder for folder in INCLUDE_FOLDERS):
        return True
    return False

def gather_files(base_dir):
    collected = []
    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_FOLDERS]
        for f in files:
            path = os.path.join(root, f)
            if should_include(os.path.relpath(path, base_dir)):
                collected.append(path)
    return collected

def write_chunks(files, base_dir, output_dir="chunks"):
    os.makedirs(output_dir, exist_ok=True)
    buffer = ""
    chunk_index = 1
    
    for file in files:
        rel_path = os.path.relpath(file, base_dir)
        with open(file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        entry = f"\n\n===== FILE: {rel_path} =====\n\n{content}\n"
        
        if len(buffer) + len(entry) > MAX_CHARS:
            with open(os.path.join(output_dir, f"chunk_{chunk_index}.txt"), "w", encoding="utf-8") as out:
                out.write(buffer)
            buffer = ""
            chunk_index += 1
        
        buffer += entry

    if buffer.strip():
        with open(os.path.join(output_dir, f"chunk_{chunk_index}.txt"), "w", encoding="utf-8") as out:
            out.write(buffer)

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    files = gather_files(BASE_DIR)
    write_chunks(files, BASE_DIR)
    print("✅ Done! Check the 'chunks/' folder for output.")
