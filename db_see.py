
from rag.vector_store import vector_store

data = vector_store.get(
    include=["documents", "metadatas"]
)

print("Total records:", len(data["ids"]))

for i in range(len(data["ids"])):

    print("\n" + "=" * 60)

    print("ID:", data["ids"][i])
    print("Metadata:", data["metadatas"][i])
    print("Text:", data["documents"][i])
