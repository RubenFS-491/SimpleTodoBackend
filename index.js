import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import express from 'express';
import bodyParser from 'body-parser'

const app = express();
const port = 3000;
var jsonParser = bodyParser.json()

async function getUserTodos(userId) {
	try {
		const db = await open({
			filename: './db/todoDb.db',
			driver: sqlite3.Database
		})

		const result = await db.all(`SELECT Id,
											UserId,
											Text,
											Checked
							 FROM todos 
							 WHERE UserId = ?
							 ORDER BY Id Desc`, [userId])

		await db.close()
		return result
	} catch (error) {
		return []
	}
}

async function addNewTodo(userId, text) {
	try {
		const db = await open({
			filename: './db/todoDb.db',
			driver: sqlite3.Database
		})

		const result = await db.run('INSERT INTO todos(UserId, Text) VALUES(?, ?)', [userId, text], (success, err) => {
			if (err) {
				throw err;
			}
		})
		await db.close()
		return ({
			Id: result.lastID,
			UserId: userId,
			Text: text,
			Checked: 0
		})
	} catch (error) {
		return false
	}
}
async function editTodo(userId, body) {
	const { id, text, checked } = body;
	try {
		const db = await open({
			filename: './db/todoDb.db',
			driver: sqlite3.Database
		})

		const result = await db.run('UPDATE todos SET Text = ?, Checked = ? WHERE Id = ? AND UserId = ?', [text, checked, id, userId], (success, err) => {
			if (err) {
				throw err;
			}
		})
		await db.close()
		return ({
			Id: id,
			UserId: userId,
			Text: text,
			Checked: checked
		})
	} catch (error) {
		return false
	}
}

async function deleteTodo(userId, id) {

	try {
		const db = await open({
			filename: './db/todoDb.db',
			driver: sqlite3.Database
		})

		const result = await db.run('DELETE FROM todos WHERE Id = ? AND UserId = ?', [id, userId], (success, err) => {
			if (err) {
				throw err;
			}
		})
		await db.close()
		return true
	} catch (error) {
		return false
	}
}


app.get('/getUserTodos', async (req, res) => {
	const userId = req.headers.usercode;
	const result = await getUserTodos(userId)
	res.send(result)
});

app.post('/addnewtodo', jsonParser, async (req, res) => {
	const userId = req.headers.usercode;
	const text = req.body.text
	if (!text) res.send(false)
	const result = await addNewTodo(userId, text);
	res.send(result)
});

app.post('/editTodo', jsonParser, async (req, res) => {
	const userId = req.headers.usercode;
	const body = req.body
	if (!body) res.send(false)
	const result = await editTodo(userId, body);
	res.send(result)
});

app.delete('/deleteTodo', jsonParser, async (req, res) => {
	const userId = req.headers.usercode;
	const id = req.body.id
	if (!id) res.send(false)
	const result = await deleteTodo(userId, id);
	res.send(result)
});

app.listen(port, () => {
	console.log(`Example API listening on http://localhost:${port}!`)
});



// let db = new sqlite3.Database('./db/todoDb.db', sqlite3.OPEN_READWRITE, (err) => {
// 	if (err) {
// 		console.error(err.message);
// 	}
// 	console.log('Connected to the todoDb database.');
// });

// db.serialize(() => {
// 	db.each(`SELECT Id,
//                   UserId,
// 									Text,
// 									Checked
//            FROM todos`, (err, row) => {
// 		if (err) {
// 			console.error(err.message);
// 		}
// 		console.log(row.Id + "\t" + row.UserId + "\t" + row.Text + "\t" + row.Checked);
// 	});
// });

// db.close((err) => {
// 	if (err) {
// 		return console.error(err.message);
// 	}
// 	console.log('Close the database connection.');
// });