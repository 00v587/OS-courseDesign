import {createRouter , createWebHistory } from 'vue-router';
import DynamicPartition from "../components/MemoryManagement.vue"; // 动态分区页面
import DynamicPaging from "../components/DynamicPaging.vue"; // 动态分页页面

const routes = [
  { path: '/MermoryManagement', name: 'DynamicPartition', component: DynamicPartition },
  { path: '/DynamicPaging', name: 'DynamicPaging', component: DynamicPaging },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
