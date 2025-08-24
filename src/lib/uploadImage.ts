import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "@/lib/firebase";

const storage = getStorage(firebaseApp);

export async function uploadImage(file: File, userId: string) {
  const fileRef = ref(storage, `posts/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
