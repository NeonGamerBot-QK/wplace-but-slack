---
title: "Hey where did all the slack channels go?"
description: "My experince and thoughts on a recent security vuln i found which allowed you to gain slack workspace admin (bypass's 2fa)"
date: 2025-10-22 # YYYY-MM-DD
tags: ["markdown", "hackclub", "security", "slack", "clubs"]
cover: "/images/clubs_vuln.png"
---
Before we jump into my story lets add some context:
## Hackclub Security program 
The hackclub security program was made by [3kh0](https://3kh0.net) and was made so teens could get money for security vulns they find!. many payouts have been issued from there, ranging to leaked creds which leaked 100+ people's pii and airtable sql injection. The security has had its fair share of programs suffering but the programs which suffer the most are usually shiba and the hackclub clubs stuff.

## What actually happened now? what do you mean by "Hey where did all the slack channels go?"
Well... i was looking through the [hackclubs club dashboard source code](https://github.com/hackclub/club-dashboard), and in the very long ai generated main.py which was coded by the main club led eng, i was ctrl + f'ing thru the code looking at the api endpoints, and i find this url which is being used to invite members to the slack as multi channel guests, at first it looks normal but then i check there is absolutly no authentication headers on this code which is extremly concerning since this gives a way into the hackclub slack with no logging what so ever making it easy for the slack to be raided, so i find the code on the lead club eng's github (for some reason not on the hackclub org), in the screenshot below you can see the code contains a clone of my own code for [explorpheus](https://github.com/hackclub/explorpheus) but this one seems to be code writeen in python for a simple server which allows inviting people into the slack with no auth, but i look in another folder (named attached_assets) and i see some concerning things.. **Log files**.
![ss of code structure](./ss_of_stuff.png)

## The log files
These log files were something which should have NOT ever been pushed to github, but also while finding some stuff in these files i made a fatal mistake of not recording the proof correctly. I opened the folder and found something absoured in the log files... there was a xoxd token to a **workspace admin slack account**, this is an **extreme** security risk! in slack admins cannot demote other admins so if this token were to fall into malicous hands! for example, like in the title Where did all the slack channels go could actually become true! someone could mass promote every account to admin and then make a bot to mass delete every public channel in the slack! they could also raid the slack with inapporopiate stuff! This is severe as a **Root access** security vulnrability in a way. Also in the same directory as the log files i found a screenshot of the cookies tab uploaded straight to github! when i found the token i made a major flaw trying to get proof because i was really suprised when the token worked, like beyond shocked! since i was very shocked first thing i did was hit the log out button. this idemditly destoryed the token, the only issue on my side is a had not much evidence of me finding this vuln... after i logged out on the admin account i created a security report asap and then a group chat chat was made to discuss.. 

## What happened when i reported this
Well, lets just say the lead club eng dev and first they were willing to go forward with the bounty and then proposed 50$? im not a greedy person but 1/7 of the actual bounty price is what you are offering seems very rude, so then it is explained to him that this is a very severe bug and payout cant be really be 50 and is not decided. Then later in the discussion it is mentioned that clubs has no many huh ?? (this is actually true, the bounty money is comming from the [hackclub hq account](https://hcb.hackclub.com/hq)).Then he is asking for proof which i then share things i saw from the account i saw while i was logged in which he says are untrue for some reason which i would beg to differ but i would agree from what i was saying it seemed what i claimed as proof could be wrong. Then the token is compared to the one in the coolify deployment and they match meaning the token was valid but the lead club eng says thats valid and then claims i was "snooping" and claims it "justifies nothing" (see ss below).. backing up claims does not count as snooping esp since i wasnt the one who checked this was checked by the person who runs the security program.
![ss of msg of justifies nothing]()

He then still claims there is not enough proof, which then i remember i had tested his flow earlier so i show him the account i invited using the bot and then still claims there is not enough data now since i destoryed the token, after i write a little more proof explaining how the the bot invitation shows the token deactivation he then "semi approved" and then claims for it to be around 50-75 which is still not close to the real value.. he then also mentions the commit was 3 months ago, when i found the token i wasnt actually looking at the commit time stamp but when i found it was pushed to the public 3 months i was suprised.. After our discussion today where the bounty was brought up to his boss and before he approved the bounty for 350$. After that i dm'd the lead club eng asking him to remove the log files from the git repo (possible via git force pushing), and i am still waiting on a response from him which onces thats done ill link the repo :).


## What am i doing after this
well im going to start recording when i find a vuln now...
but i am also doing some stuff like fixing up the code and this blog post itself!.
here are some links to what im doing rn:
- [Link to pr which fixes it on club dash](https://github.com/hackclub/club-dashboard/pull/100)
- soon: link to commit/repo of where to vuln was (link will be added once code is force pushed)
- soon: second pr implementing auth
- soon: link to ach wire.