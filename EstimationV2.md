# Project Estimation - FUTURE
Date: 26.04.2023

Version: 2


# Estimation approach
In this document we are trying to do a approximate estimation on the duration and effort it would take for our team to complete this project. 
# Estimate by size
### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of modules to be developed   | 50                            |             
|  A = Estimated average size per module, in LOC       |        150                    | 
| S = Estimated size of project, in LOC (= NC * A) | 7500|
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |                   750                   |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) |22500 | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |         ~4.7           |               

# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|requirement document    |20 |
| GUI prototype |150|
|design document |20|
|code |300|
| unit tests |150|
| api tests |150|
| management documents  |10|



# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|1 Requirement engineering (Requrirement document)|65 |
|2 Design (Design document)| 65|
|3 Implementation (Coding + Testing)| 520|
|4 Integration (Coding + Testing)| 225|
|3 Management |25 |
###
![Gantt chart](diagrams/ganttchartV2.png)

# Summary

Here are the results of the three estimation approaches.

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size |750|~4.7
| estimate by product decomposition |800|5
| estimate by activity decomposition |900|~5.6




