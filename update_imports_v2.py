import os
import re

# Directory to search
directory = r'C:\Users\Lenovo\Desktop\code\kids-own\my-app\src\app'

# Regex pattern for relative imports
# Matches (' or ") followed by one or more (../) followed by one of the specified directories
# Added 'pages', 'config', 'layouts' just in case.
pattern = r'([\'"])(\.\./)+(components|services|store|types|utils|lib|data|assets|pages|config|layouts)'
replacement = r'\1@/src/\3'

# Function to update files
def update_imports(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Perform the replacement
                new_content = re.sub(pattern, replacement, content)
                
                if new_content != content:
                    print(f"Updating: {file_path}")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    update_imports(directory)
