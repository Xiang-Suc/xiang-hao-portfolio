import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(10, 6))
dates = ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12', 'Feb 19', 'Feb 26']
rates = [5, 12, 18, 25, 22, 15, 10, 7, 4]
colors = ['green' if x < 20 else 'red' for x in rates]

ax.bar(dates, rates, color=colors)
ax.set_ylim(0, 30)
ax.set_xlabel('Date')
ax.set_ylabel('Covid Infection Rate (%)')
ax.set_title('Covid Infection Rate Tracker - Demo')

for i, v in enumerate(rates):
    ax.text(i, v + 0.5, str(v) + '%', ha='center')

plt.tight_layout()
plt.savefig('covid_tracker.png')
print('Image saved!') 