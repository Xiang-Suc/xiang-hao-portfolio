import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

### Decision tree with perceptron classifier
class Dtree():
    def __init__(self, train_x, train_y, num_partitions):
        # Sort the training set by y values
        self.train_y, indices = train_y.sort()
        self.train_x = train_x[indices]
        l, input_size = train_x.shape
        self.partitions = [int(i) for i in np.linspace(0, l-1, num_partitions+1)][1:-1]
        self.targets = self.train_y[self.partitions]
        self.model = [Perceptron(input_size) for _ in range(len(self.partitions))]
    def train(self):
        for i in range(len(self.partitions)):
            # data, labels = train_x[partitions[i-1]]
            self.model[i].train(self.train_x, self.train_y, self.targets[i], 100, verbose=False)
    def predict_weighted(self, test_x, test_y):
        preds = []
        for i, s in enumerate(self.partitions):
            preds.append(self.model[i].output(test_x))
        preds = torch.Tensor([p.numpy() for p in preds]) # .sigmoid()
        print(self.targets)
        print(preds)

    def predict_binary_search(self, test_x, test_y):
        preds = [[-np.inf, np.inf] for _ in range(len(test_y))]
        def __predict(i, x, s, inds):
            pred = self.model[s].predict(x, self.targets[s])
            if pred:
                preds[i][0] = s
                inds = [ind for ind in inds if ind > s]
                if inds == []: return
                __predict(i, x, s+1, inds)
            else:
                preds[i][1] = s
                inds = [ind for ind in inds if ind < s]
                if inds == []: return
                __predict(i, x, s-1, inds)
        for i, (x, y) in enumerate(zip(test_x, test_y)):
            avail_inds = [i for i in range(len(self.partitions))]
            __predict(i, x, len(self.partitions)//2, avail_inds)
        return preds

class Perceptron():
    def __init__(self, input_size):
        self.w = torch.rand(input_size)
        self.b = torch.rand(1)
    def train(self, X, Y, target, iters, lr=0.001, verbose=True):
        tot_loss = []
        for _ in range(iters):
            correct = 0
            for x, y in zip(X, Y):
                label = 1 if y > target else 0
                y_pred = x.dot(self.w) + self.b
                label_pred = 1 if y_pred > target else 0
                self.w += lr * (label - label_pred) * x
                self.b += lr * (label - label_pred)
                if label == label_pred: correct += 1
            loss = 1 - correct / len(Y)
            if verbose: print(_, loss)
            tot_loss.append(loss)
        return tot_loss
    def test(self, X, Y, target):
        pred = X.matmul(self.w) + self.b
        labels_pred = pred > target
        labels_gt = Y > target
        acc = (labels_pred == labels_gt).count_nonzero().item() / len(Y)
        return acc
    def output(self, X):
        return X.matmul(self.w) + self.b
    def predict(self, X, target):
        pred = self.output(X)
        return pred > target

# soft-ordering 1-dimensional CNN: https://medium.com/spikelab/convolutional-neural-networks-on-tabular-datasets-part-1-4abdd67795b6
# 305 -> 1000 -> 50 * 20
class CNN1(nn.Module):
    def __init__(self):
        super(CNN1, self).__init__()
        self.input_dim = 305    # Number of features at input
        self.output_dim = 1     # Number of target values
        self.sign_size = 20     # Size of a signal in 1st CNN layer
        self.cha_input = 50     # Number of channels in the 1st CNN layer
        self.cha_hidden = 100   # Number of channels in the hidden CNN layer
        self.output_size = self.sign_size//4 * self.cha_hidden # 500
        self.K = 2              # Channel increase rate from the 1st CNN layer to a hidden CNN layer
        self.dropout_input = 0.25
        self.dropout_hidden = 0.25
        self.dropout_output = 0.25

        # 1: FC layer: 305 -> 1000
        self.bn0 = nn.BatchNorm1d(self.input_dim)
        self.drop0 = nn.Dropout(self.dropout_input)
        self.prep = nn.Linear(self.input_dim, self.sign_size * self.cha_input, bias=True) # Introduce more features
        # self.prep = nn.utils.weight_norm(prep) # Decouple weight paramaters into magnitude and ditection

        # 2: CNN layer 1: 50 x 20 -> 100 x 10
        self.bn1 = nn.BatchNorm1d(self.cha_input)
        self.conv1 = nn.Conv1d(self.cha_input, self.cha_input * self.K, kernel_size=5, stride=1, padding=2, groups=self.cha_input, bias=True)
        # self.conv1 = nn.utils.weight_norm(conv1, dim=None) # Not implemented for MPS
        self.pool1 = nn.AdaptiveAvgPool1d(output_size=self.sign_size//2)

        # 3: CNN layer 2: 100 x 10 -> 100 x 10
        self.bn2 = nn.BatchNorm1d(self.cha_input * self.K)
        self.drop2 = nn.Dropout(self.dropout_hidden)
        self.conv2 = nn.Conv1d(self.cha_input * self.K, self.cha_hidden, kernel_size=3, stride=1, padding=1, bias=True)
        # self.conv2 = nn.utils.weight_norm(conv2, dim=None)

        # 4: CNN layer 3: 100 x 10 -> 100 x 10
        self.bn3 = nn.BatchNorm1d(self.cha_hidden)
        self.drop3 = nn.Dropout(self.dropout_hidden)
        self.conv3 = nn.Conv1d(self.cha_hidden, self.cha_hidden, kernel_size=3, stride=1, padding=1, bias=True)
        # self.conv3 = nn.utils.weight_norm(conv3, dim=None)

        # 5: CNN layer 4: 100 x 10 -> 100 x 5
        self.bn4 = nn.BatchNorm1d(self.cha_hidden)
        self.conv4 = nn.Conv1d(self.cha_hidden, self.cha_hidden, kernel_size=5, stride=1, padding=2, groups=self.cha_hidden, bias=True)
        # self.conv4 = nn.utils.weight_norm(conv4)
        self.pool4 = nn.AvgPool1d(kernel_size=4, stride=2, padding=1)

        # 6: Flatten: 100 x 5 -> 500
        self.flatten = nn.Flatten()

        # 7: FC layer: 500 -> 1
        self.bn7 = nn.BatchNorm1d(self.output_size)
        self.drop7 = nn.Dropout(self.dropout_output)
        self.out = nn.Linear(self.output_size, self.output_dim, bias=True)
        # self.out = nn.utils.weight_norm(out)

        # Loss
        self.loss = nn.MSELoss()

    def forward(self, x):
        # 1: FC
        if x.shape[0] > 1:
            x = self.bn0(x)
        x = self.drop0(x)
        x = F.celu(self.prep(x))

        x = x.reshape(x.shape[0], self.cha_input, self.sign_size) # batch x in channel x signal size

        # 2: CNN 1
        x = self.bn1(x)
        x = F.relu(self.conv1(x))

        x = self.pool1(x)

        # 3: CNN 2
        x = self.bn2(x)
        x = self.drop2(x)
        x = F.relu(self.conv2(x))

        x_s = x

        # 4: CNN 3
        x = self.bn3(x)
        x = self.drop3(x)
        x = F.relu(self.conv3(x))

        # 5: CNN 4
        x = self.bn4(x)
        x = self.conv4(x)

        x = x + x_s
        x = F.relu(x)

        x = self.pool4(x)

        # 6: flattem
        x = self.flatten(x)

        # 7: output
        if x.shape[0] > 1:
            x = self.bn7(x)
        x = self.drop7(x)
        x = self.out(x)


        return x

class CNN2(nn.Module):
    def __init__(self):
        super(CNN2, self).__init__()
        filter_size = 3
        padding = 1
        self.conv1 = nn.Conv2d(1, 6, kernel_size=4)
        self.conv2 = nn.Conv2d(6, 12, kernel_size=4)
        self.conv3 = nn.Conv2d(12, 24, kernel_size=3, padding=1)
        # self.conv4 = nn.Conv2d(12, 24, filter_size, padding=padding)
        self.pool = nn.MaxPool2d(2, 2) # N -> N/2
        self.fc1 = nn.Linear(24 * 37 * 37, 128)
        self.fc2 = nn.Linear(128, 80)
        self.fc3 = nn.Linear(80, 1)
        self.drop = nn.Dropout(0.25)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x))) # 305 -> 302 -> 151
        # print(x.shape)
        x = self.pool(F.relu(self.conv2(x))) # 151 -> 148 -> 74
        x = self.pool(F.relu(self.conv3(x))) # 74 -> 74 -> 37
        # x = self.pool(F.relu(self.conv4(x))) # 38 -> 38 -> 19
        # print(x.shape)
        x = torch.flatten(x, 1) # flatten all dimensions except batch
        # print(x.shape)
        x = self.drop(x)
        x = F.relu(self.fc1(x))
        x = self.drop(x)
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x

### Linear regressor
class LinearRegressor(nn.Module):
    def __init__(self):
        super(LinearRegressor, self).__init__()
        self.fc = nn.Linear(305, 1)
    def forward(self, x):
        return self.fc(x)
#################################
# y_hat = w * phi(x) + b
# L = |y_hat - y|
# w = w - dL / dw = w - sign(y_hat - y) * phi(x) = w + sign(y - y_hat) * phi(x)
#
class KernelizedLinearRegressor():
    def __init__(self, input_size, num_train_data):
        self.input_size = input_size
        self.alpha = torch.zeros(num_train_data)
        self.bias = torch.zeros(1)

    def step(self, x, y, X):
        y_hat = (1 + X.matmul(x)).pow(2).dot(self.alpha) + self.bias
        # loss = |y_hat - y|
        loss = y_hat.item() - y.item()

### Feedforward neural network
class FNN(nn.Module):
    def __init__(self):
        super(FNN, self).__init__()
        self.fc1 = nn.Linear(305, 200) # 304
        self.fc2 = nn.Linear(200, 100)
        self.fc3 = nn.Linear(100, 50)
        self.fc4 = nn.Linear(50, 1)
    def forward(self, x):
        # print(x.view(-1, 304).shape)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = F.relu(self.fc3(x))
        x = self.fc4(x)
        return x

if __name__ == '__main__':
    import numpy as np
    n = 1
    x = np.random.rand(n, 304)
    x = torch.Tensor(x)
    y = torch.Tensor(np.random.rand(n, 1) * 1e6)
    criteria = nn.L1Loss()
    net = FNN()
    opt = torch.optim.Adam(net.parameters(), lr=0.01)
    # print(net)
    for _ in range(5):
        out = net(x)
        loss = criteria(out, y)
        loss.backward()
        opt.step()
        print(loss.item())