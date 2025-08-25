// src/components/CommentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    image: string | null;
  };
};

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ uid: string } | null>(null);

  // ✅ Load Firebase auth user
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ uid: user.uid });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Add comment
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);

    try {
      const token = await getAuth(firebaseApp).currentUser?.getIdToken();
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (res.ok) {
        const { data } = await res.json();
        setComments((prev) => [data, ...prev]);
        setNewComment("");
      } else {
        console.error("Failed to add comment", res.status);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {currentUser && (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !newComment.trim()}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </form>
      )}

      {/* Comment list */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-muted-foreground">No comments yet.</p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 items-start">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.image || undefined} />
              <AvatarFallback>
                {comment.user.email?.[0].toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{comment.user.email}</p>
              <p className="text-sm">{comment.text}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
