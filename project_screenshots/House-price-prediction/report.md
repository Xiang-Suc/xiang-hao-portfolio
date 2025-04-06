### ECS 271 Project

Team members: Xiang Hao, Kai Lan


- Missing data
When we processed the dataset, we found there are some categories are empty for some house data. This casued unpredicted impacts, like output after training is NaN and loss is NaN. The apporach we use to figure this problem out is using pandas.fillna(0) to revise those empty data to 0.

- Idea for marking one or more variables be more important so that the model can increase the weight and importance for those variables to train the model. In this case, depending on different conditions, the predicting price will also be different.