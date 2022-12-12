import { keyInSelect, question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: 'omdb' });
console.log("Welcome to search-movies-cli!");



var userNum = question(`
    Welcome to searc-movies-cli!
    [1] Search
    [2] See favourites
    [3] Quit
`);
// options = ['1','2','3'],
// index = keyInSelect(options,'Your choice: ')
if (userNum === '1'){
    var userInput = question(`Search: `);
    console.log("Your search input: " + userInput)
    searchByInput()
    var maybeFaves = question(`Would you like to add any of these to your favourites? [Y/N]`)
    if (maybeFaves === 'Y'){
        var setFaves = question(`
            Pick based on the movie index,
            to pick multiple films chose the range, like this: 3 5
            this will add movies with index, 3, 4, 5
            Which movies would you like to add: 
        `);
        let numArr = setFaves.split(' ')
        if (numArr.length < 2){
            console.log('One movie to faves')
        } else if (numArr.length > 1){
            console.log('multiple movies to be added')
        } else {
            console.log('invalid input')
        }
    } else {
        console.log("Okay bye!")
    }
} else if (userNum === '2'){
    console.log('faves coming up!')
} else if (userNum === '3'){
    console.log("you've chosen to quit!")
}

// get the movie_id from the created table based on the index
function addingToFaves(setFaves:string): string {
    let numArr = setFaves.split(' ')
    if (numArr.length < 2){
        console.log('One movie to faves')
        return `
        INSERT INTO favourites (movie_id)
        ${}
        `
    } else if (numArr.length > 1){
        console.log('multiple movies to be added')
    } else {
        console.log('invalid input')
    }
}

function searchString(input:string):string {
    return input.toLowerCase() !== 'q' && input.toLowerCase() 
}

function searchQuery(userInput:string):string{
    return `
        select id, name, date, runtime, budget, revenue, vote_average, votes_count 
        from movies
            where LOWER(name) like '%${searchString(userInput)}%'
            and kind = 'movie'
        order by date DESC
        limit 10
        `
}

async function searchByInput(){
// things go right
	try {
	// this way we will not go to the next 
	// line UNTIL the first is executed
		await client.connect()
		console.log('Connected successfully')
		const results = await client.query(searchQuery(userInput))
		console.table(results.rows)
// things go wrong
	} catch (ex) {
		console.log(`something wrong happened ${ex}`)
// where things eventually end up
	} finally {
		await client.end()
		console.log('client disconnected successfully')
	}
}

async function favourites(){
    // things go right
        try {
        // this way we will not go to the next 
        // line UNTIL the first is executed
            await client.connect()
            console.log('Connected successfully')
            const results = await client.query(searchQuery(`
            SELECT movies.name
            FROM favourites 
                JOIN movies  
                ON movies.id=favourites.movie_id;
            `))
            console.table(results.rows)
    // things go wrong
        } catch (ex) {
            console.log(`something wrong happened ${ex}`)
    // where things eventually end up
        } finally {
            await client.end()
            console.log('client disconnected successfully')
        }
}

async function addFaves(){
    // things go right
        try {
        // this way we will not go to the next 
        // line UNTIL the first is executed
            await client.connect()
            console.log('Connected successfully')
            const results = await client.query(searchQuery(setFaves))
            console.table(results.rows)
    // things go wrong
        } catch (ex) {
            console.log(`something wrong happened ${ex}`)
    // where things eventually end up
        } finally {
            await client.end()
            console.log('client disconnected successfully')
        }
}