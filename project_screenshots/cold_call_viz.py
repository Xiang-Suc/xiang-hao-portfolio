import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle

# Create figure and axis
fig, ax = plt.subplots(figsize=(12, 8))

# Set background color
ax.set_facecolor('#f5f5f5')

# Create main window rectangle
main_window = Rectangle((1, 1), 10, 6, linewidth=2, edgecolor='black', facecolor='#e0e0e0', alpha=0.7)
ax.add_patch(main_window)

# Add title bar
title_bar = Rectangle((1, 6.5), 10, 0.5, linewidth=1, edgecolor='black', facecolor='#3498db', alpha=0.9)
ax.add_patch(title_bar)
ax.text(6, 6.75, 'Cold Call System', ha='center', va='center', fontsize=14, fontweight='bold', color='white')

# Add on-deck students panel
students_panel = Rectangle((1.5, 2), 9, 2.5, linewidth=1, edgecolor='black', facecolor='white', alpha=0.9)
ax.add_patch(students_panel)
ax.text(6, 4.7, 'On-Deck Students', ha='center', va='center', fontsize=12, fontweight='bold')

# Add student slots
student_names = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson']
for i, name in enumerate(student_names):
    x_pos = 2.5 + i * 2.2
    student_box = Rectangle((x_pos, 2.5), 1.8, 1, linewidth=1, edgecolor='black', facecolor='#f8f9fa', alpha=0.9)
    ax.add_patch(student_box)
    ax.text(x_pos + 0.9, 3, name, ha='center', va='center', fontsize=10)

# Add control buttons
button_labels = ['Call', 'Next', 'Import', 'Export']
button_colors = ['#28a745', '#ffc107', '#17a2b8', '#6c757d']
for i, (label, color) in enumerate(zip(button_labels, button_colors)):
    x_pos = 2.5 + i * 2.2
    button = Rectangle((x_pos, 1.5), 1.8, 0.5, linewidth=1, edgecolor='black', facecolor=color, alpha=0.7)
    ax.add_patch(button)
    ax.text(x_pos + 0.9, 1.75, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')

# Highlight current student
highlight = Rectangle((4.7, 2.5), 1.8, 1, linewidth=2, edgecolor='red', facecolor='none')
ax.add_patch(highlight)

# Add application title
ax.text(6, 7.5, 'Cold Call System UI Mockup', ha='center', va='center', fontsize=16, fontweight='bold')

# Add project description
description = (
    "The Cold Call System helps professors randomly select students to answer questions,\n"
    "allowing 'on-deck' students to prepare responses. This increases student enthusiasm\n"
    "and participation while reducing awkward silences in the classroom."
)
ax.text(6, 0.5, description, ha='center', va='center', fontsize=10, style='italic')

# Set axis limits and remove ticks
ax.set_xlim(0, 12)
ax.set_ylim(0, 8)
ax.set_xticks([])
ax.set_yticks([])

plt.tight_layout()
plt.savefig('cold_call_system.png')
print('Image saved!') 