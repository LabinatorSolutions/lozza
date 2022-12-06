import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
from torch.utils.data import Dataset, DataLoader
import numpy as np
import math
from json import JSONEncoder
import json

class EncodeTensor(JSONEncoder,Dataset):
    def default(self, obj):
        if isinstance(obj, torch.Tensor):
            return obj.cpu().detach().numpy().tolist()
        return super(NpEncoder, self).default(obj)

class data768(Dataset):
    def __init__(self):
        xy = np.loadtxt('c:/projects/lozza/trunk/testing/data/quiet-labeled0.csv',delimiter=",",dtype=np.float32)
        self.x = torch.from_numpy(xy[:,1:])
        self.y = torch.from_numpy(xy[:,[0]])
        self.n_samples = xy.shape[0]
        
    def __getitem__(self,index):
        return self.x[index],self.y[index]
    
    def __len__(self):
        return self.n_samples


batch_size = 1000
lr = 0.01
num_epochs=10000

dataset = data768()

total_samples = len(dataset)

dataloader = DataLoader(dataset=dataset,batch_size=batch_size,shuffle=True)
trainloader = DataLoader(dataset=dataset,batch_size=total_samples,shuffle=False)

num_batches = math.ceil(total_samples / batch_size)

print('batch_size',batch_size)
print('lr',lr)
print('total_samples',total_samples)

class Net(torch.nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.l1 = nn.Linear(768,20)
        #self.l2 = nn.Linear(8, 8)
        #self.l3 = nn.Linear(8, 4)
        self.l4 = nn.Linear(20, 1)
    
    def forward(self, x):
        x = torch.relu(self.l1(x))
        #x = torch.relu(self.l2(x))
        #x = torch.relu(self.l3(x))
        x = torch.sigmoid(self.l4(x))
        return x


model = Net()

with open('c:/projects/lozza/trunk/testing/data/quiet-labeled0.json', 'w') as fp:
     json.dump(model.state_dict(), fp, cls=EncodeTensor)
     
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=lr)

n_total_steps = len(dataloader)

print('num batches',n_total_steps)

for epoch in range(num_epochs):
 
    for i, (x, y) in enumerate(dataloader):  
        outputs = model(x)
        loss = criterion(outputs, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        if (i+1) % 100 == 0:
            print (f'Epoch={epoch+1}, Batch {i+1}, Loss={loss.item():.4f}')

    if (epoch+1) % 10 == 0:
        with torch.no_grad():
            for i, (x, y) in enumerate(trainloader):  
                outputs = model(x)
                loss2 = criterion(outputs, y)
                print (f'Epoch={epoch+1}, Overall Loss={loss2.item():.4f}')
        
  