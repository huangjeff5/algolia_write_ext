/*
 * This template contains a HTTP function that responds with a greeting when called
 *
 * Always use the FUNCTIONS HANDLER NAMESPACE
 * when writing Cloud Functions for extensions.
 * Learn more about the handler namespace in the docs
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about parameters in the docs
 */

const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');

const FIRESTORE_COLLECTION_TO_INDEX = process.env.FIRESTORE_COLLECTION_TO_INDEX;
const ALGOLIA_ID = process.env.ALGOLIA_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
const ALGOLIA_SEARCHABLE_ATTRIBUTES = process.env.ALGOLIA_SEARCHABLE_ATTRIBUTES.split(',')
const ALGOLIA_CUSTOM_RANKING = process.env.ALGOLIA_CUSTOM_RANKING.split(',')

console.log(`INDEXING FIRESTORE: ${FIRESTORE_COLLECTION_TO_INDEX}`)

exports.onDocumentCreated = functions.handler.firestore.document.onCreate((snap, context) => {
	// Get the document
	const doc = snap.data();

	const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
	const index = client.initIndex(ALGOLIA_INDEX_NAME);

	// Add an 'objectID' field which Algolia requires
	console.log("THIS IS SNAP REF", snap.ref);
	console.log("THIS IS SNAP REF PATH", snap.ref.path);

	//doc.objectID = context.params.documentId;
	doc.objectID = snap.ref.path.split("/").pop();
	return index.setSettings({
		searchableAttributes: ALGOLIA_SEARCHABLE_ATTRIBUTES,
		customRanking: ALGOLIA_CUSTOM_RANKING
	}).then(() => {
		return index.saveObject(doc);
	})
});