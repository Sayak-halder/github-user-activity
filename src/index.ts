import axios from "axios";

interface GitHubEvent {
    type: string;
    repo: {
        name: string;
    };
    payload: {
        action: string;
        ref_type?: string;
        commits?: { [key: string]: any }[];
    };
}

async function fetchGitHubActivity(username: string): Promise<GitHubEvent[]> {
    try {
        const res = await axios.get(
                `https://api.github.com/users/${username}/events`
        );
        return res.data as GitHubEvent[];
    } catch (error:any) {
        // @ts-ignore
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error("User not found. Please check the username.");
            } else {
                throw new Error(`Error fetching data: ${error.response?.status}`);
            }
        } else {
            throw new Error("An unknown error occured.");
        }
    }
}

function displayActivity(events:GitHubEvent[]):void{
    if(events.length===0){
        console.log("No recent activity foound.");
        return;
    }

    events.forEach((event)=>{
        let action:string;
        switch(event.type){
            case "PushEvent":
                const commitCount=event.payload.commits?event.payload.commits.length:0;
                action=`Pushed ${commitCount} commit(s) to ${event.repo.name}`;
                break;
            case "IssuesEvent":
                action=`${event.payload.action?.charAt(0).toUpperCase()+event.payload.action?.slice(1)} an issue in ${event.repo.name}`;
                break;
            case "WatchEvent":
                action=`Starred ${event.repo.name}`;
                break;
            case "ForkEvent":
                action=`Forked ${event.repo.name}`;
                break;
            case "CreateEvent":
                action=`Created ${event.payload.ref_type} in ${event.repo.name}`;
                break;
            default:
                action=`${event.type.replace("Event","")} in ${event.repo.name}`;
                break;
        }
        console.log(`-  ${action} .`);
    })
}

const username:string =process.argv[2];
if(!username){
    console.log("Please provide a github username.");
    process.exit(1);
}

fetchGitHubActivity(username)
.then((event)=>{
    displayActivity(event);
})
.catch((err)=>{
    console.error(err.message);
    process.exit(1);
});