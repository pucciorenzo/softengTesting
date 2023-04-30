# Project Estimation - FUTURE
Date: 26.04.2023

Version: 2


# Estimation approach
In this document we are trying to do a approximate estimation on the duration and effort it would take for our team to complete this project taking into consideration this time the version 2 of the requirement documentation. 
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
Note: We are starting from April 17, 2023 in order to be somehow consistent with the past estimation document (EstimationV1) and its ending date.

# Summary
As a result we are presenting a summary with the estimated effort and duration for each estimation approach, by size, by product decomposition, and by activity decompostion. As we can see in the table below, both estimated effort and duration increase respectively for different estimation approaches. This is to be considered a normal behavior with a very easy logical explanation. In the estimation by size we are only considering coding part, while for the two other approaches we are also considering documentation and extra processes, so as a result the estimation by size is the lowest. When we compare estimation by product decomposition and estimation by activity decomposition we have a much smaller gap, since the reference measuring units are much more related and comparable to each other, but estimation by activitiy decomposition yields a higher estimated effort and therefore duration. This is because, in activity decomposition when we calculate person hours for the activity and lay it out in Gantt chart we may add extra hours to complete full working days for the easiness of calculation and representation. Another explanation for these differences in the end estimated effort and duration values is also the tendency to overestimate a bit, since it is easier to overestimate slightly in the requirement engineering phase than to have to allocate extra time and resources at the middle or end of the project. 

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size |750|~4.7
| estimate by product decomposition |800|5
| estimate by activity decomposition |900|~5.6




