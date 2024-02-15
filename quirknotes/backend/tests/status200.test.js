  const { MongoClient, ObjectId } = require("mongodb");

  const mongoURL = "mongodb://127.0.0.1:27017";
  const dbName = "quirknotes";

  let db;
  let client;

  beforeAll(async () => {
    client = new MongoClient(mongoURL);
    try {
      await client.connect();
      db = client.db(dbName);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    await client.close();
  });

  // Collections to manage
  const COLLECTIONS = {
    notes: "notes",
  };
  // above ensures that the database is empty in the beginning of each test case

  test("1+2=3, empty array is empty", () => {
    expect(1 + 2).toBe(3);
    expect([].length).toBe(0);
  });

  const SERVER_URL = "http://localhost:4000";

  test("/postNote - Post a note", async () => {
    const title = "NoteTitleTest";
    const content = "NoteTitleContent";

    const postNoteRes = await fetch(`${SERVER_URL}/postNote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    });

    const postNoteBody = await postNoteRes.json();
    expect(postNoteRes.status).toBe(200);
    expect(postNoteBody.response).toBe("Note added succesfully.");
  });

  test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {
    const getAllNoteRes = await fetch(`${SERVER_URL}/getAllNotes`);
    const getAllNoteBody = await getAllNoteRes.json();
    expect(getAllNoteBody.response).toStrictEqual([]);
    expect(getAllNoteRes.status).toBe(200);
  });

  test("/getAllNotes - Return list of two notes for getAllNotes", async () => {
    // First we insert 2 notes into the database
    const titleOne = "note one title";
    const contentOne = "note one content";
    const createdAtOne = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title: titleOne,
      content: contentOne,
      createdAt: createdAtOne,
    });

    const insertedIdOne = result.insertedId.toString();

    const titleTwo = "note two title";
    const contentTwo = "note two content";
    const createdAtTwo = new Date();

    // Add second note to database
    result = await collection.insertOne({
      title: titleTwo,
      content: contentTwo,
      createdAt: createdAtTwo,
    });

    const insertedIdTwo = result.insertedId.toString();;

    const getAllNotesRes = await fetch(`${SERVER_URL}/getAllNotes`);
    const getAllNotesBody = await getAllNotesRes.json();

    expect(getAllNotesBody.response.length).toBe(2);

    expect(getAllNotesBody.response[0]._id.toString()).toEqual(insertedIdOne);
    expect(getAllNotesBody.response[0].title).toEqual(titleOne);
    expect(getAllNotesBody.response[0].content).toEqual(contentOne);
    expect(getAllNotesBody.response[0].createdAt).toEqual(createdAtOne.toISOString());

    expect(getAllNotesBody.response[1]._id.toString()).toEqual(insertedIdTwo);
    expect(getAllNotesBody.response[1].title).toEqual(titleTwo);
    expect(getAllNotesBody.response[1].content).toEqual(contentTwo);
    expect(getAllNotesBody.response[1].createdAt).toEqual(createdAtTwo.toISOString());

    expect(getAllNotesRes.status).toBe(200);
  });

  test("/deleteNote - Delete a note", async () => {
    // First we insert a note into the database
    const titleOne = "note one title";
    const contentOne = "note one content";
    const createdAtOne = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title: titleOne,
      content: contentOne,
      createdAt: createdAtOne,
    });

    const insertedIdOne = result.insertedId.toString();
    
    const countBefore = await collection.countDocuments({});

    const deleteNoteRes = await fetch(`${SERVER_URL}/deleteNote/${insertedIdOne}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const deleteNoteBody = await deleteNoteRes.json();

    const countAfter = await collection.countDocuments({});

    expect(deleteNoteBody.response).toBe(`Document with ID ${insertedIdOne} deleted.`);
    expect(countBefore - countAfter).toBe(1);
    expect(deleteNoteRes.status).toBe(200);
  });
  
  test("/patchNote - Patch with content and title", async () => {
    // First we insert a note into the database
    const title = "note one title";
    const content = "note one content";
    const createdAt = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title,
      content,
      createdAt,
    });

    const countBefore = await collection.countDocuments({});

    const insertedId = result.insertedId;

    const patchNoteRes = await fetch(`http://localhost:4000/patchNote/${insertedId}`,
      {method: "PATCH",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({title: "patched note one title", content: "patched note one content"})})
    
    const patchNoteBody = await patchNoteRes.json();

    const patchedNote = await collection.findOne({ _id: insertedId });
    const countAfter = await collection.countDocuments({});

    expect(patchNoteBody.response).toBe(`Document with ID ${insertedId} patched.`);
    expect(countBefore).toEqual(countAfter);
    expect(patchNoteRes.status).toBe(200);

    expect(patchedNote._id).toEqual(insertedId);
    expect(patchedNote.title).toEqual('patched note one title');
    expect(patchedNote.content).toEqual('patched note one content');
    expect(patchedNote.createdAt).toEqual(createdAt);
  });
  
  test("/patchNote - Patch with just title", async () => {
    // First we insert a note into the database
    const title = "note one title";
    const content = "note one content";
    const createdAt = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title,
      content,
      createdAt,
    });

    const countBefore = await collection.countDocuments({});

    const insertedId = result.insertedId;

    const patchNoteRes = await fetch(`http://localhost:4000/patchNote/${insertedId}`,
      {method: "PATCH",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({title: "patched note one title"})})
    
    const patchNoteBody = await patchNoteRes.json();

    const patchedNote = await collection.findOne({ _id: insertedId });
    const countAfter = await collection.countDocuments({});

    expect(patchNoteBody.response).toBe(`Document with ID ${insertedId} patched.`);
    expect(countBefore).toEqual(countAfter);
    expect(patchNoteRes.status).toBe(200);

    expect(patchedNote._id).toEqual(insertedId);
    expect(patchedNote.title).toEqual('patched note one title');
    expect(patchedNote.content).toEqual(content);
    expect(patchedNote.createdAt).toEqual(createdAt);
  });
  
  test("/patchNote - Patch with just content", async () => {
    // First we insert a note into the database
    const title = "note one title";
    const content = "note one content";
    const createdAt = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title,
      content,
      createdAt,
    });

    const countBefore = await collection.countDocuments({});

    const insertedId = result.insertedId;

    const patchNoteRes = await fetch(`http://localhost:4000/patchNote/${insertedId}`,
      {method: "PATCH",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({content: "patched note one content"})})
    
    const patchNoteBody = await patchNoteRes.json();

    const patchedNote = await collection.findOne({ _id: insertedId });
    const countAfter = await collection.countDocuments({});

    expect(patchNoteBody.response).toBe(`Document with ID ${insertedId} patched.`);
    expect(countBefore).toEqual(countAfter);
    expect(patchNoteRes.status).toBe(200);

    expect(patchedNote._id).toEqual(insertedId);
    expect(patchedNote.title).toEqual(title);
    expect(patchedNote.content).toEqual('patched note one content');
    expect(patchedNote.createdAt).toEqual(createdAt);
  });

  test("/deleteAllNotes - Delete one note", async () => {
    // First we insert 1 note into the database
    const titleOne = "note one title";
    const contentOne = "note one content";
    const createdAtOne = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title: titleOne,
      content: contentOne,
      createdAt: createdAtOne,
    });

    const countBefore = await collection.countDocuments({});

    const deleteAllNotesRes = await fetch(`${SERVER_URL}/deleteAllNotes`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const deleteAllNotesBody = await deleteAllNotesRes.json();

    const countAfter = await collection.countDocuments({});

    expect(deleteAllNotesBody.response).toBe(`1 note(s) deleted.`);
    expect(countBefore - countAfter).toBe(1);
    expect(countAfter).toBe(0);
    expect(deleteAllNotesRes.status).toBe(200);
  });
  
  test("/deleteAllNotes - Delete three notes", async () => {
    // First we insert 3 notes into the database
    const titleOne = "note one title";
    const contentOne = "note one content";
    const createdAtOne = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title: titleOne,
      content: contentOne,
      createdAt: createdAtOne,
    });

    const titleTwo = "note two title";
    const contentTwo = "note two content";
    const createdAtTwo = new Date();

    // Add second note to database
    result = await collection.insertOne({
      title: titleTwo,
      content: contentTwo,
      createdAt: createdAtTwo,
    });

    const titleThree = "note three title";
    const contentThree = "note three content";
    const createdAtThree = new Date();

    // Add second note to database
    result = await collection.insertOne({
      title: titleThree,
      content: contentThree,
      createdAt: createdAtThree,
    });

    const countBefore = await collection.countDocuments({});

    const deleteAllNotesRes = await fetch(`${SERVER_URL}/deleteAllNotes`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const deleteAllNotesBody = await deleteAllNotesRes.json();

    const countAfter = await collection.countDocuments({});

    expect(deleteAllNotesBody.response).toBe(`3 note(s) deleted.`);
    expect(countBefore - countAfter).toBe(3);
    expect(countAfter).toBe(0);
    expect(deleteAllNotesRes.status).toBe(200);
  });
  
  test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
    // First we insert a note into the database
    const title = "note one title";
    const content = "note one content";
    const createdAt = new Date();

    // Add first note to database
    const collection = db.collection(COLLECTIONS.notes);
    let result = await collection.insertOne({
      title,
      content,
      createdAt,
    });

    const countBefore = await collection.countDocuments({});

    const insertedId = result.insertedId;

    const patchNoteRes = await fetch(`http://localhost:4000/updateNoteColor/${insertedId}`,
      {method: "PATCH",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ color: '#FF0000' })})
    
    const patchNoteBody = await patchNoteRes.json();

    const patchedNote = await collection.findOne({ _id: insertedId });
    const countAfter = await collection.countDocuments({});

    expect(patchNoteBody.message).toBe('Note color updated successfully.');
    expect(countBefore).toEqual(countAfter);
    expect(patchNoteRes.status).toBe(200);

    expect(patchedNote._id).toEqual(insertedId);
    expect(patchedNote.title).toEqual(title);
    expect(patchedNote.content).toEqual(content);
    expect(patchedNote.createdAt).toEqual(createdAt);
    expect(patchedNote.color).toEqual('#FF0000');
  });