import pandas as pd
import torch
from torch.utils.data import Dataset
import numpy as np

def init_data(file, train_ratio):
    file_ext = file.rsplit(".", 1)[1]
    if file_ext == 'csv': data = pd.read_csv(file)
    elif file_ext == "pkl": data = pd.read_pickle(file)
    else: raise Exception("Unknown file type (support .csv or .pkl).")
    # Shuffle data
    # data = data.sample(frac=1).reset_index(drop=True)

    # Separate numeric and categorical data
    num_data, cat_data = data.select_dtypes(include="number"), data.select_dtypes(exclude="number")

    # Fill in missing data
    num_data = num_data.apply(lambda x: x.fillna(x.mean()), axis=0)
    cat_data.fillna("NA", inplace=True)

    # Separate into x and y
    data = pd.concat([num_data, cat_data], axis=1)
    X, Y = data.drop('Id', axis=1), data['SalePrice']

    # One hot encode X
    X = pd.get_dummies(X)

    # Nomalize X and Y
    x_mean, y_mean = X.mean(), Y.mean()
    x_std, y_std = X.std(), Y.std()
    X = (X - x_mean) / x_std
    Y = (Y - y_mean) / y_std

    # Separate into training and test sets
    split = int(data.shape[0] * train_ratio)
    train_x = torch.Tensor(X.values[:split])
    train_y = torch.Tensor(Y.values[:split])
    test_x  = torch.Tensor(X.values[split:])
    test_y  = torch.Tensor(Y.values[split:])
    return train_x, train_y, test_x, test_y

def compute_loss(model, data_loader, criterion, device):
    ttot_loss = 0.0
    model.eval()
    for i, (inputs, labels) in enumerate(data_loader):
        inputs, labels = inputs.to(device), labels.to(device) # Move to GPU / CPU
        with torch.no_grad():
            labels = labels.unsqueeze(-1)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
        ttot_loss += loss.item()
    return ttot_loss / len(data_loader.dataset)

def compute_rel_error(model, data_x, data_y, device):
    model.eval()
    data_x, data_y = data_x.to(device), data_y.to(device)
    with torch.no_grad():
        outputs = model(data_x).ravel()
        all_loss_train = abs(outputs - data_y) / abs(data_y)
    return all_loss_train

### Fetch the data
class MyDataset(Dataset):
    def __init__(self, data, labels):
        self.x = data
        self.y = labels
    def __len__(self):
        return len(self.y)
    def __getitem__(self, i):
        return self.x[i], self.y[i]

# Report the accuracy on the given data
def test_accuracy(net, dataloader):
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in dataloader:
            # images, labels = images.to(device), labels.to(device)
            outputs = net(images)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    acc = 100 * correct / total
    return acc

if __name__ == '__main__':
    import numpy as np
    # dataset = MyDataset("train.csv")
    dataset = pd.read_csv("train.csv")
    dataset.fillna(0, inplace=True)
    # dataset = dataset.replace(np.nan, 0)
    # dataset.loc[0].values = 'NA'
    # print(dataset.loc[7].values[3])
    # na_vals = dataset.isna().sum(axis=1)
    # import matplotlib.pyplot as plt
    # plt.hist(na_vals)
    # plt.show()
    # dataset = pd.get_dummies(dataset, dummy_na=True)
    print(dataset.to_string())
    # dataset.to_csv("train_dum.csv")