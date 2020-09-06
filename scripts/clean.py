import json
import pathlib
import os
from pprint import pprint
networkId = "1"
networkId3 = "5"
networkId2 = "1001"
from os import listdir, makedirs
from os.path import isfile, join
mypath = os.path.abspath(os.getcwd()) + "/build/contracts/"
newpath = os.path.abspath(os.getcwd()) + "/clean_build/contracts/"
os.makedirs(newpath, exist_ok=True)
sitepath = os.path.abspath(os.getcwd()) + "/ham-www/src/ham/clean_build/contracts/"
os.makedirs(sitepath, exist_ok=True)
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
onlyfiles

for file in onlyfiles:
    with open(mypath+file, "r") as f:
        if "json" in file:
            try:
                cleaned = {}
                a = json.loads(f.read())
                cleaned["abi"] = a["abi"]
                cleaned["networks"] = {}
                if (networkId in a["networks"].keys()):
                    cleaned["networks"][networkId] = {}
                    cleaned["networks"][networkId]["links"] = a["networks"][networkId]["links"],
                    cleaned["networks"][networkId]["address"] = a["networks"][networkId]["address"],
                    cleaned["networks"][networkId]["address"] = cleaned["networks"][networkId]["address"][0]
                    cleaned["networks"][networkId]["transactionHash"] = a["networks"][networkId]["transactionHash"]
                if (networkId2 in a["networks"].keys()):
                    cleaned["networks"][networkId2] = {}
                    cleaned["networks"][networkId2]["links"] = a["networks"][networkId2]["links"],
                    cleaned["networks"][networkId2]["address"] = a["networks"][networkId2]["address"],
                    cleaned["networks"][networkId2]["address"] = cleaned["networks"][networkId2]["address"][0]
                    cleaned["networks"][networkId2]["transactionHash"] = a["networks"][networkId2]["transactionHash"]
                if (networkId3 in a["networks"].keys()):
                    cleaned["networks"][networkId3] = {}
                    cleaned["networks"][networkId3]["links"] = a["networks"][networkId3]["links"],
                    cleaned["networks"][networkId3]["address"] = a["networks"][networkId3]["address"],
                    cleaned["networks"][networkId3]["address"] = cleaned["networks"][networkId3]["address"][0]
                    cleaned["networks"][networkId3]["transactionHash"] = a["networks"][networkId3]["transactionHash"]
                with open(newpath+file, "w+") as c:
                    print(newpath+file)
                    c.write(json.dumps(cleaned))
                with open(sitepath+file, "w+") as c:
                    print(sitepath+file)
                    c.write(json.dumps(cleaned))
            except Exception as e:
                print(e)
                print(file)
