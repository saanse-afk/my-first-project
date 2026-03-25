import { MainLayout } from "@/components/layout/main-layout"
import { PostsTable } from "@/components/posts/posts-table"

export default function PostsPage() {
  return (
    <MainLayout title="All Posts" subtitle="Browse and sort your Instagram posts">
      <PostsTable />
    </MainLayout>
  )
}
