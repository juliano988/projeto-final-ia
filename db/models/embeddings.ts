import EmbeddingsSchema from "../schemas/embeddings";
import connection from "../connection";

export default function createEmbeddingsModelBasedOnCollectionName(
  collectionName: string
) {
  if (!collectionName || typeof collectionName !== "string") {
    throw new Error("Collection name must be a non-empty string");
  }

  return (
    connection.models[collectionName] ||
    connection.model(collectionName, EmbeddingsSchema)
  );
}
