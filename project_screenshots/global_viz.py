import matplotlib.pyplot as plt
import numpy as np

# Sample data for world development visualization
countries = ['USA', 'China', 'Germany', 'India', 'Brazil']
gdp_per_capita = [65297, 12556, 51203, 2256, 7011]
life_expectancy = [77.3, 77.1, 81.1, 69.7, 75.5]
education_index = [0.90, 0.70, 0.94, 0.55, 0.68]

# Convert to numpy arrays for easier manipulation
gdp_per_capita = np.array(gdp_per_capita)
life_expectancy = np.array(life_expectancy)
education_index = np.array(education_index)

# Create a figure with a specific size
fig, ax = plt.subplots(figsize=(12, 8))

# Create scatter plot with bubble size based on education index
scatter = ax.scatter(
    gdp_per_capita, 
    life_expectancy, 
    s=education_index*500, 
    alpha=0.7, 
    c=range(len(countries)), 
    cmap='viridis'
)

# Add country labels
for i, country in enumerate(countries):
    ax.annotate(
        country, 
        (gdp_per_capita[i], life_expectancy[i]),
        xytext=(7, -5),
        textcoords='offset points'
    )

# Add title and labels
ax.set_title('Global Development Indicators', fontsize=16)
ax.set_xlabel('GDP per Capita (USD)', fontsize=12)
ax.set_ylabel('Life Expectancy (years)', fontsize=12)

# Add a legend explaining bubble size
handles, labels = scatter.legend_elements(prop="sizes", alpha=0.6, num=3)
legend_labels = ['Low', 'Medium', 'High']
ax.legend(handles, legend_labels, loc="upper left", title="Education Index")

# Add grid lines
ax.grid(True, linestyle='--', alpha=0.7)

# Set axis limits
ax.set_xlim(0, 70000)
ax.set_ylim(65, 85)

plt.tight_layout()
plt.savefig('global_dashboard.png')
print('Image saved!') 