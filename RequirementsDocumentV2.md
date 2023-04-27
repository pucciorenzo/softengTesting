# Requirements Document - future EZWallet

Date: 

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
| ----------------- |-----------|
| 1.0.0 				| same as V1 |

# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
		+ [Use case 1: Create account](#use-case-1-create-account)
		+ [Use case 2: Log in](#use-case-2-log-in)
		+ [Use case 3: View account](#use-case-3-view-account)
		+ [Use case 4: Log out](#use-case-4-log-out)
		+ [Use case 5: Create category](#use-case-5-create-a-category)
		+ [Use case 6: View categories](#use-case-6-view-categories)
		+ [Use case 7: Create transaction](#use-case-7-create-a-transaction)
		+ [Use case 8: View transactions](#use-case-8-view-transactions)
		+ [Use case 9: Delete transaction](#use-case-9-delete-transaction)
		+ [Use case 10: View transactions grouped by categories](#use-case-10-view-transactions-grouped-by-category)
		+ [Use case 11: Remove ads](#use-case-11-remove-ads)




- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)
- [Software Bugs](#software-bugs)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.

# Stakeholders
| Stakeholder name  			| Description | 
| ----------------- 			|-----------|
| User						| tracks their expenses |
| Project Team 				| develops, tests and maintains app |
| Company(Owner)			| owns the app, employs and oversees developers, manages finances, takes executive decisions during app development |
| Admin 					| track app usage |
| Google AdSense			| generates revenue from the app by displaying ads on the website |
| PayPal Checkout	| payment service provider |

# Context Diagram and interfaces
## Context Diagram
<!--Define here Context diagram using UML use case diagram -->
![Context Diagram](diagrams/ContextDiagramV2.svg)

<!--actors are a subset of stakeholders-->

## Interfaces
<!--
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>
-->
| Actor 		| Logical Interface 	| Physical Interface  |
| ------------- |-----------------| ------------------|
| User, Admin  	|GUI			 		| PC, Smartphone, Tablet |
| Google AdSense| Internet link, api		| https://adsense.google.com/start/
| Paypal Checkout 	| Internet link, api | https://developer.paypal.com/docs/checkout/ |

# Stories and personas
Persona 1: student, male, 20, low income.
* Story: Rented a house, needs to keep track of his expenses so he can pays his rent each month.

Persona 2: employee, female, 42, medium income, married with children, providing for the whole family.
* Story: Since she’s the only one working in the family, she needs to know how family spends money.

Persona 3: unemployed, male, 35, no income with little savings.
* Story: Needs to keep track of his expenses and which are the categories where he spends too much.



# Functional and non functional requirements

## Functional Requirements
<!--
\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>
-->

| ID 		| Description  	|
| ----- 	|-------------| 
| <b>FR1</b>		| <b>Manage account</b> |
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.1	| Create account|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.2	| Log in  		|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.3	| View account	|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.4 	| Log out 		|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.5 	| Authenticate and authorize	|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.6 	| Reset password	|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.7 	| Change password	|
|  &nbsp;&nbsp;&nbsp;&nbsp; FR1.8	| Change username	|
| <b>FR2</b>		| <b>Manage categories</b> | 
| &nbsp;&nbsp;&nbsp;&nbsp; FR2.1	| Define category	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR2.2	| View categories	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR2.4	| Edit category	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR2.3	| Delete category	|
| <b>FR3</b>		| <b>Manage transactions</b>	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR3.1	| add transaction		|
| &nbsp;&nbsp;&nbsp;&nbsp; FR3.2	| View transaction		|
| &nbsp;&nbsp;&nbsp;&nbsp; FR3.2	| list all transactions	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR3.3	| remove transaction	|
| <b>FR4</b>		| <b>Manage ads</b>|
| &nbsp;&nbsp;&nbsp;&nbsp; FR5.1	| receive ads 	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR5.2	| show ads 		|
| &nbsp;&nbsp;&nbsp;&nbsp; FR5.3	| remove ads 	|
| <b>FR6</b>		| <b>Manage budget</b>|
| &nbsp;&nbsp;&nbsp;&nbsp; FR6.1	| set budget 	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR6.2	| edit budget	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR6.3	| remove budget	|
| <b>FR7</b>		| <b>View statistics</b>|
| &nbsp;&nbsp;&nbsp;&nbsp; FR7.1	| Show current month's remaining budget	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR7.2	| Show current month's transactions 	|
| &nbsp;&nbsp;&nbsp;&nbsp; FR7.3	| Show, for the current month, a pie-chart of total amount of transactions per categories.|
| &nbsp;&nbsp;&nbsp;&nbsp; FR7.4	| Show, for user provided data range, all transactions and a pie-chart of total amount of transactions per categories in that data range.|
| <b>FR7</b>		| <b>Analyze userbase</b>|

## Non Functional Requirements
<!--
\<Describe constraints on functional requirements>
-->
| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |-------------| -----| -----|
| NFR1 | Usability | no training required, user rating > 4,5/5, freemium conversion rate 10% | FR:1.1,1.2,1.3,1.4,2,3,4 |
| NFR2 | Efficiency | < 0.2ms function response time | All FR |
| NFR3 | Reliability | > 99.99% uptime, < 1hr/year downtime | FR:1.1,1.2,1.3,1.4,2,3,4 |
| NFR4 | Portability | Latest stable Firefox, Chrome, Edge browsers with JS and cookies enabled | FR:1.1,1.2,1.3,1.4,2,3,4 |
| NFR5 | Security | GDPR, CCPA, ISO/IEC 27000-series compliance | All FR |
| NFR6 | Maintainability | < 24 hr app migration to different service, < 6 hr recovery after failure | All FR |


# Use case diagram and use cases


## Use case diagram
<!--
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>
-->

![Use Case Diagram](diagrams/UseCaseDiagramV2.svg)

## Use cases
<!-- ## Use case: Create account
Precondition: User has no account

Scenario 1 (nominal):

*	User ask to sign up
*	System asks username
*	System asks email
*	System asks password
*	System stores account

Post condition: User is registered

Scenario (exceptions):

•	Email already used

Post condition: User is not registered
 -->
### Use case 1: Create account
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User does not have an account 	|
|  Post condition     	| User has account 		|
|  Nominal Scenario     | User starts registration process. The system asks user their details to create an account. User provides the details which is used by the system to create an account for the user.|
|  Exceptions     		| User already has an account, user does not verify email |

<!--##### Scenario 1.1 : Nominal -->
| Scenario 1.1 		| 	Nominal			|
| ------------- 	|-------------| 
|  Precondition     | User does not have an account |
|  Post condition   | User has an account |
| Step#	| Description  			|
| 1    	| User asks to register |  
| 2    	| System asks username, email, password |
| 3    	| User enters username, email, password  |
| 4		| System checks that a user with provided email does not already exist |
| 5		| System generates hash value from password |
| 6		| System generates a verify link from the provided email and hashed password.|
| 7		| System sends the verify link to the email address.|
| 8		| User clicks on the verify link. |
| 9		| System stores the username, email and hashed password. |

<!--##### Scenario 1.2 : Exception -->
| Scenario 1.2 		| 	Exception			|
| ------------- 	|-------------| 
|  Precondition     | Email already used to create an account |
|  Post condition   | New account not created |
| Step#	| Description  			|
| 1    	| User asks to register |  
| 2    	| System asks username, email, password |
| 3    	| User enters username, email, password  |
| 4		| System checks that a user with provided email does not already exist |
| 5		| System finds an account with the same email.
| 6		| System returns error message "already registered" |

<!--##### Scenario 1.3 : Exception -->
| Scenario 1.3 		| 	Exception			|
| ------------- 	|-------------| 
|  Precondition     | User provides wrong email or user does not verify email|
|  Post condition   | New account not created |
| Step#	| Description  			|
| 1    	| User asks to register |  
| 2    	| System asks username, email, password |
| 3    	| User enters username, email, password  |
| 4		| System checks that a user with provided email does not already exist |
| 5		| System generates hash value from password |
| 6		| System generates a verify link from the provided email and hashed password.|
| 7		| System sends the verify link to the email address.|
| 8		| Verification link expires. |

<!--## Use case: Login
Precondition: User has account

Scenario 1 (nominal):
*	1 User asks to login
*	2 System asks email and password
*	3 User enters email and password
*	4 System checks, email and password correct, user is authorized

Post condition: user is authorized

Scenario (exceptions):
*	User does not exist 
*	User is already logged in
*	Email or password wrong

Post condition  (for all exceptional scenarios): user is not authorized
-->
### Use case 2: Log in
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User has account		|
|  Post condition     	| User is authorized 	|
|  Nominal Scenario     | User enter  email and password to login. System verifies credentials and authorizes user. |
|  Variants     | User is already logged in and has access token. System notifies user already logged in. |
|  Exceptions     		| User does not have account. Wrong email or password. |

<!--##### Scenario 2.1 : Nominal -->
| Scenario 2.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User has account and user is logged out |
|  Post condition   | User is logged in and authorized |
| Step#	| Description  			|
| 1    	| User asks to log in |  
| 2    	| System asks email and password |
| 3    	| User enters email and password  |
| 4		| System searches corresponding account using provided email |
| 5		| System verifies user does not already have accessToken |
| 6		| System generates hash from provided password and verifies that it matches with the stored password hash.
  7		| System generates an access token and a refresh token.|
  8		| System stores the refresh token and returns both refresh token and access token to the user.|
| 9     | User uses the tokens for later queries to the system. |

<!--##### Scenario 2.2 : Nominal -->
| Scenario 2.2 		| 	Variant			|
| ------------- 	|-----------------| 
|  Precondition     | User has account and user is logged in |
|  Post condition   | User is still logged in and authorized |
| Step#	| Description  			|
| 1    	| User asks to log in |  
| 2    	| System asks email and password |
| 3    	| User enters email and password  |
| 4		| System searches corresponding account using provided email |
| 5		| System verifies user does not already have accessToken |
| 6		| User already has accessToken. |
| 7     | System returns "you are already logged in"|

<!--##### Scenario 2.3 : Exception -->
| Scenario 2.3 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User does not have an account or provides wrong unregistered email |
|  Post condition   | User is neither logged in nor authorized |
| Step#	| Description  			|
| 1    	| User asks to log in |  
| 2    	| System asks email and password |
| 3    	| User enters email and password |
| 4		| System searches corresponding account using provided email |
| 5		| System does not find account |
| 6		| System returns error "need to register." |

<!--##### Scenario 2.3 : Exception -->
| Scenario 2.4 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User has account, is not logged in and provides either wrong but existing email or wrong password |
|  Post condition   | User is neither logged in nor authorized |
| Step#	| Description  			|
| 1    	| User asks to log in |  
| 2    	| System asks email and password |
| 3    	| User enters email and password  |
| 4		| System searches  corresponding account using provided email |
| 5		| System verifies user does not already have accessToken |
| 6		| System generates hash from provided password and verifies that it matches with the stored password hash.
  7		| Password hashes do not match and system returns error "wrong credentials" |

### Use case 3: View account
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in 	|
|  Post condition     	| User's account information is displayed 		|
|  Nominal Scenario     | User asks to view his account information and system shows it |
|  Exceptions     		| User is not logged in. User does not provide his own username. |

<!--##### Scenario 3.1 : Nominal -->
| Scenario 3.1 		| 	Nominal			|
| ------------- 	|-------------| 
|  Precondition     | User is logged in |
|  Post condition   | User's account is displayed |
| Step#	| Description  			|
| 1    	| User asks to view his account |
| 2    	| System asks username |  
| 3    	| User provides his username |
| 4    	| System verifies user has both access and refresh token. |
| 5    	| System finds user account using the refresh token. |
| 6		| System verifies the provided username matches found account's username |
| 7		| System returns the account information.

<!--##### Scenario 3.2 : Exception -->
| Scenario 3.2 		| 	Exception			|
| ------------- 	|-------------| 
|  Precondition     | User is not logged in |
|  Post condition   | User's account is not displayed |
| Step#	| Description  			|
| 1    	| User asks to view his account |
| 2    	| System asks username |  
| 3    	| User provides his username |
| 4    	| System verifies user has both access and refresh token. |
| 5    	| System finds empty access token or refresh token.|
| 6   	| System returns error "unauthorized". |

| Scenario 3.3 		| 	Exception			|
| ------------- 	|-------------| 
|  Precondition     | User  |
|  Post condition   | User's account is displayed |
| Step#	| Description  			|
| 1    	| User asks to view his account |
| 2    	| System asks username |  
| 3    	| User provides his username |
| 4    	| System verifies user has both access and refresh token. |
| 5    	| System finds user account using the refresh token. |
| 6		| System verifies the provided username matches found account's username |
| 7		| Usernames do not match. System returns error "unauthorized".


### Use case 4: Log out
<!--Precondition: User is logged in

Scenario 1 (nominal):
*	User ask to log out
*	System logs user out

Post condition: User is not authorized anymore
<!--
Scenario (exceptions):
*	User already logged out
*	User not found

Post condition (for all): User is not authorized anymore
-->

| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| User is logged out and not authorized any more	|
|  Nominal Scenario     | User asks to log out, and system removes authorization and logs user out |
|  Variants     | User is already logged out. System notifies user logged out. |
|  Exceptions     		| User does not have account. Wrong email/password combination. |

| Scenario 4.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | User is logged out and not authorized any more |
| Step#	| Description  			|
| 1     | User asks to log out |
| 2     |  System verifies non empty access and refresh tokens. |
| 3		| System uses refresh token to search for the user.	|
| 4		| System sends empty access and refresh tokens. |
| 5 	| System clears stored user's refresh token. |
| 6		| System returns  "logged out"|


| Scenario 4.2 		| 	Variant			|
| ------------- 	|-----------------| 
|  Precondition     | User has account and is logged out |
|  Post condition   | User is still logged out and not authorized |
| Step#	| Description  			|
| 1     | User asks to log out |
| 2     |  System verifies non empty access and refresh tokens. |
| 3		| System finds empty token so user is already logged out and system returns  "logged out"|

| Scenario 4.3 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User has wrong refresh token |
|  Post condition   | User not authorized |
| Step#	| Description  			|
| 1     | User asks to log out |
| 2     |  System verifies non empty access and refresh tokens. |
| 3		| System uses refresh token to search for the user.	|
| 4		| System does not find user using the refresh token and returns error "user not found"|


### Use case 5: Reset Password
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User does not remember their password	|
|  Post condition     	| A new password is created	|
|  Nominal Scenario     | User asks to reset their password, system starts password reset process, user sets new password |
|  Exceptions     		| User does not have an account, user does not verify email |

| Scenario 5.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | Category is created |
| Step#	| Description  			|
| 1     | User asks to reset their password |
| 2     |  System asks to provide email |
| 3		| User provides email	|
| 4		| System verifies an account with the provided email exists |
| 5		| System sends password reset link to the email provided |
| 6		| User clicks on the reset link |
| 7 	| System asks new password |
| 8 	| User provides new password |
| 9 	| System hashes the password and stores the hashed password in the account |
| 10 	| System returns message password reset successful |

| Scenario 5.2 		| 	Exception		|
| ------------- 	|-----------------	| 
|  Precondition     | User does not provide correct email, email has not been used to create account |
|  Post condition   | No change, password reset fails |
| Step#	| Description  			|
| 1     | User asks to reset their password |
| 2     |  System asks to provide email |
| 3		| User provides email	|
| 4		| System verifies an account with the provided email exists |
| 5		| System does not find an account
| 6 	| System returns error user not found |

| Scenario 5.2 		| 	Exception		|
| ------------- 	|-----------------	| 
|  Precondition     | User does not provide correct email, account with provided email exists |
|  Post condition   | No change, password reset fails |
| Step#	| Description  			|
| 1     | User asks to reset their password |
| 2     |  System asks to provide email |
| 3		| User provides email	|
| 4		| System verifies an account with the provided email exists |
| 5		| System sends password reset link to the email provided |
| 6		| User does not click on the reset link |
| 7		| The link expires |



### Use case 5: Create a category
<!--Precondition: User logged in
*	User asks to create a category
*	System asks the type
*	System asks the color
*	System creates the category

Post condition: Category is created
-->
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| A category is created	|
|  Nominal Scenario     | User asks to create a  category, system creates it |
|  Exceptions     		| User is not authorized |

| Scenario 5.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | Category is created |
| Step#	| Description  			|
| 1     | User asks to create a category |
| 2     |  System asks type and color of the category |
| 3		| User provides type and color	|
| 4		| System verifies access token |
| 5		| System creates and stores the category|
| 6 	| System returns created category|


| Scenario 5.2		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | Category not created |
| Step#	| Description  			|
| 1     | User asks to create a category |
| 2     |  System asks type and color of the category |
| 3		| User provides type and color	|
| 4		| System verifies access token |
| 5		| System finds empty token and returns error "unauthorized" |



### Use case 6: View categories
<!--Precondition: User logged in
*	User asks to view all categories
*	System provides all existing categories
-->
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| All categories are displayed	|
|  Nominal Scenario     | User asks to view all categories, system displays them |
|  Exceptions     		| User is not authorized |

| Scenario 6.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | All categories are displayed |
| Step#	| Description  			|
| 1     | User asks to view all categories|
| 2     |  System verifies access token |
| 3		| System returns all categories as type and color	|

| Scenario 6.2 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | No category is displayed |
| Step#	| Description  			|
| 1     | User asks to view all categories|
| 2     |  System verifies access token |
| 3     |  System finds invalid access token |
| 4		| System returns error "unauthorized"|



### Use case 7: Create a transaction
<!--Precondition: User logged in
*	User asks to create a transaction
*	System asks the name, amount and type

Post condition: Transaction is created
-->
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| A transaction is created	|
|  Nominal Scenario     | User asks to create a  transaction, system creates it |
|  Exceptions     		| User is not authorized |

| Scenario 7.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | Transaction is created |
| Step#	| Description  			|
| 1     | User asks to create a transaction |
| 2     |  System asks name, amount and type of the transaction |
| 3		| User provides the name, amount and type 	|
| 4		| System verifies access token |
| 5		| System creates and stores the transaction|
| 6 	| System returns created transaction|


| Scenario 7.2		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | Transaction is not created |
| Step#	| Description  			|
| 1     | User asks to create a transaction |
| 2     |  System asks name, amount and type of the transaction |
| 3		| User provides the name, amount and type 	|
| 4		| System verifies access token |
| 5		| System finds empty token and returns error "unauthorized" |


### Use case 8: View transactions
<!--Precondition: User logged in
*	User asks to view all transactions
*	System provides all existing transactions
-->
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| All transactions are displayed	|
|  Nominal Scenario     | User asks to view all transactions, system displays them |
|  Exceptions     		| User is not authorized |

| Scenario 8.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | All transactions are displayed |
| Step#	| Description  			|
| 1     | User asks to view all transactions|
| 2     |  System verifies access token |
| 3		| System returns all transactions |

| Scenario 8.2 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | No transaction is displayed |
| Step#	| Description  			|
| 1     | User asks to view all transactions|
| 2     |  System verifies access token |
| 3     |  System finds invalid access token |
| 4		| System returns error "unauthorized"|

### Use case  9: Delete transaction
<!--Precondition: User logged in
*	User asks to delete a transaction
*	System asks user to indentify the transaction
*	System deletes the transaction

Post condition: Transaction is deleted
-->
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| A transaction is deleted	|
|  Nominal Scenario     | User asks to delete a  transaction, system deletes it |
|  Exceptions     		| User is not authorized |

| Scenario 9.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | Transaction is deleted |
| Step#	| Description  			|
| 1     | User asks to delete a transaction providing the transaction id |
| 2		| System verifies access token |
| 3		| System searches the transaction using id and deletes it|
| 4 	| System returns deleted transaction|


| Scenario 9.2		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | Transaction is not deleted |
| Step#	| Description  			|
| 1     | User asks to delete a transaction providing the transaction id |
| 2		| System verifies access token |
| 3     |  System finds invalid access token |
| 4		| System returns error "unauthorized"|


### Use case 10: View transactions grouped by category
<!--Precondition: User logged in
*	User asks to view transactions grouped by category
*	System shows the transactions grouped by category
-->
| Actors Involved      	| User 			|
| ------------- 		|-------------| 
|  Precondition     	| User is logged in	|
|  Post condition     	| All transactions grouped by categories are displayed	|
|  Nominal Scenario     | User asks to view all transactions grouped by categories, system displays them |
|  Exceptions     		| User is not authorized |

| Scenario 10.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | All transactions are displayed grouped by categories|
| Step#	| Description  			|
| 1     | User asks to view all transactions grouped by categories|
| 2     |  System verifies access token |
| 3		| System returns all transactions grouped by categories |

| Scenario 10.2 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | No transaction is displayed |
| Step#	| Description  			|
| 1     | User asks to view all transactions grouped by categories|
| 2     |  System verifies access token |
| 3     |  System finds invalid access token |
| 4		| System returns error "unauthorized"|


### Use case 11: Remove ads
<!--Precondition: User logged in
*	User asks to buy the application
*	System connects the user to the payment provider
*	Payment provider approve the transaction
*	System remove the ads from the user interface
-->
| Actors Involved      	| User, PayPal 			|
| ------------- 		|-------------| 
|  Precondition     	| User logged in |
|  Post condition     	| Application purchased, ads removed |
|  Nominal Scenario     | User asks to buy the application, system connects the user to the payment provider, payment provider approve the transaction, system remove the ads from the user interface |
| Variant 				| Application already purchased |
|  Exceptions     		| User is not authorized, payment is not successful |

| Scenario 11.1 		| 	Nominal			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | Application purchased, ads removed |
| Step#	| Description  			|
| 1     | User asks to buy the application |
| 2     | System verifies access token |
| 3		| System open the pop up to buy the app |
| 4 	| User selects the payment method |
| 5 	| System connects the user with the payment provider |
| 6 	| Payment provider manages the payment process( outside our control ) |
| 7 	| Payment provider approves the transaction |
| 8 	| Payment provider returns the control to the application |
| 9 	| System notifies the user of the successful purchase of the app  |
| 10 	| System removes the ads from the user interface |

| Scenario 11.2 		| 	Variant			|
| ------------- 	|-----------------| 
|  Precondition     | Application already purchased |
|  Post condition   | No changes |
| Step#	| Description  			|
| 1     | User asks to buy the application |
| 2     | System verifies access token |
| 3     | System notifies the user that has already bought the app |

| Scenario 11.3 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is not authorized |
|  Post condition   | Application not purchased, ads not removed |
| Step#	| Description  			|
| 1     | User asks to buy the application |
| 2     | System verifies access token |
| 3     | System finds invalid access token |
| 4		| System returns error "unauthorized"|

| Scenario 11.4 		| 	Exception			|
| ------------- 	|-----------------| 
|  Precondition     | User is logged in |
|  Post condition   | Application not purchased, ads not removed |
| Step#	| Description  			|
| 1     | User asks to buy the application |
| 2     | System verifies access token |
| 3		| System open the pop up to buy the app |
| 4 	| User selects the payment method |
| 5 	| System connects the user with the payment provider |
| 6 	| Payment provider manages the payment process( outside our control ) |
| 7 	| Payment provider don't approves the transaction |
| 8 	| Payment provider returns the control to the application |
| 9 	| System notifies the user of the unsuccessful purchase of the app  |



# Glossary
<!--
\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 
\<concepts must be used consistently all over the document, ex in use cases, requirements etc>
-->
![GlossaryV1](diagrams/GlossaryV1.svg)

# System Design
![SystemDesignV1](diagrams/SystemDiagramV1.svg)

# Deployment Diagram 
![DeploymentDiagram](diagrams/DeploymentDiagramV1.svg)

# Software Bugs
| ID | Type			| Description  	| Refers to FR 	|
|--|------------|-------------|-------------|	
| 1  |Security		| No tokens validation, anyone can access if non-empty tokens in cookie 			| All FR |
| 2  |Security	| No user specific category/transaction separation. Any user can access/modify other user's data | FR 2, 3 |
| 3  |Functional/Security	| No admin implementation. Any one can view all users | FR 1.3, 1.5 |
