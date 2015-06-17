# Marks Check

Notify you when a mark has been released on Ness

## Setup

Create config.json file from example and fill in correct details

`npm install`
`node marksCheck`

### sechash
Unique hash to get marks
Get hash from s3p.ncl.ac.uk in "Component Marks" section by checking the iframe URL for the "Course Summary"

### stage_1_year
The year you started the course in September (+1 if after year out)

### delay
Time in minutes between each check

### notifications
Only need to fill in fields you want

#### Slack
Goto https://fruks.slack.com/services/new/incoming-webhook to create a webhook
Enter url and username/channel e.g. @user or #channel in the config file

