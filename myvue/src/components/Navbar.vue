<template>
  <div class="navbar">
    <button @click="goToPartitionPage">动态分区</button>
    <button @click="goToPagingPage">动态分页</button>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const goToPartitionPage = () => {
      router.push("/MermoryManagement");
    };

    const goToPagingPage = () => {
      router.push("/DynamicPaging");
    };

    return {
      goToPartitionPage,
      goToPagingPage,
    };
  },
};
</script>

<style scoped>
.navbar {
  position: fixed; /* 让导航栏固定在顶部 */
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center; /* 让按钮居中 */
  align-items: center;
  padding: 15px 0;
  background-color: #2c3e50; /* 深色背景 */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}
button {
  background-color: #ffffff;
  color: #2c3e50;
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px; /* 圆角按钮 */
  transition: 0.3s;
}

button:hover {
  background-color: #1abc9c; /* 悬停时变色 */
  color: white;
}
</style>
