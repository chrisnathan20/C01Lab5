  const { MongoClient } = require("mongodb");

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

    const insertedIdOne = result.insertedId;

    const titleTwo = "note two title";
    const contentTwo = "note two content";
    const createdAtTwo = new Date();

    // Add second note to database
    result = await collection.insertOne({
      title: titleTwo,
      content: contentTwo,
      createdAt: createdAtTwo,
    });

    const insertedIdTwo = result.insertedId;

    const getAllNoteRes = await fetch(`${SERVER_URL}/getAllNotes`);
    const getAllNoteBody = await getAllNoteRes.json();
    console.log(getAllNoteBody)
    expect(getAllNoteBody.response[0]._id.toString()).toBe(insertedIdOne);
    expect(getAllNoteRes.status).toBe(200);
  });

  test("/deleteNote - Delete a note", async () => {
    // Code here
    expect(false).toBe(true);
  });
  
  test("/patchNote - Patch with content and title", async () => {
    // Code here
    expect(false).toBe(true);
  });
  
  test("/patchNote - Patch with just title", async () => {
    // Code here
    expect(false).toBe(true);
  });
  
  test("/patchNote - Patch with just content", async () => {
    // Code here
    expect(false).toBe(true);
  });
  
  test("/deleteAllNotes - Delete one note", async () => {
    // Code here
    expect(false).toBe(true);
  });
  
  test("/deleteAllNotes - Delete three notes", async () => {
    // Code here
    expect(false).toBe(true);
  });
  
  test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
    // Code here
    expect(false).toBe(true);
  });