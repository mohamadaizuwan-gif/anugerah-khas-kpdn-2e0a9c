import { createFileRoute } from '@tanstack/react-router'
import { ElectionApp } from '@/components/election-app'
export const Route = createFileRoute('/admin')({
  component: () => <ElectionApp admin />,
})
