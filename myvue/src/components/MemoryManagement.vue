<template>
  <div class="memory-management">
    <!-- 左侧内容：任务管理 -->
    <div class="task-manager">
      <h2>任务管理</h2>
      <input v-model="newTask.name" placeholder="任务名" />
      <input v-model="newTask.size" type="number" placeholder="任务大小" />
      <button @click="addTask">添加任务</button>
    </div>

    <!-- 中间内容：内存布局 -->
    <div class="memory-layout">
      <h2>内存布局</h2>
      <div class="memory-blocks">
        <div
          v-for="(block, index) in memoryLayout"
          :key="index"
          :style="{
            height: (block.size / totalMemory) * 100 + '%',
            backgroundColor:
              block.status === '已分配' ? 'lightgreen' : 'lightgray',
          }"
          class="memory-block"
        >
          {{ block.name }} - {{ block.start }} to {{ block.start + block.size }}
        </div>
      </div>
    </div>

    <!-- 右侧内容：系统状态 -->
    <div class="system-status">
      <h2>系统状态</h2>
      <p>当前算法：{{ currentAlgorithm }}</p>
      <p>总内存：</p>
      <input
        v-model="totalMemory"
        type="number"
        placeholder="总内存"
        @change="initializeAllocator"
      />
      <button @click="resetMemory">重置内存</button>
      <button @click="switchAlgorithm">切换算法</button>
    </div>

    <!-- 空闲表 -->
    <div class="free-table">
      <h2>空闲表</h2>
      <table>
        <tr>
          <th>起始地址</th>
          <th>长度</th>
        </tr>
        <tr v-for="(space, index) in freeSpaces" :key="index">
          <td>{{ space.start }}</td>
          <td>{{ space.length }}</td>
        </tr>
      </table>
    </div>

    <!-- 任务表 -->
    <div class="task-table">
      <h2>任务表</h2>
      <table>
        <tr>
          <th>任务名</th>
          <th>起始地址</th>
          <th>长度</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
        <tr v-for="(task, index) in tasks" :key="index">
          <td>{{ task.name }}</td>
          <td>{{ task.start }}</td>
          <td>{{ task.size }}</td>
          <td>{{ task.status }}</td>
          <td>
            <button
              v-if="task.status === '已分配'"
              @click="reclaimMemory(task.name)"
            >
              释放
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import FirstFitAllocator from "../function/firstFit.js";
import BestFitAllocator from "../function/bestFit.js";
import WorstFitAllocator from "../function/worstFit.js";

export default {
  data() {
    return {
      newTask: { name: "", size: "" },
      tasks: [],
      freeSpaces: [],
      memoryLayout: [],
      currentAlgorithm: "首次适应",
      algorithms: ["首次适应", "最佳适应", "最坏适应"],
      currentAlgorithmIndex: 0,
      totalMemory: 100,
      allocator: null, // 初始化分配器
    };
  },

  methods: {
    initializeAllocator() {
      switch (this.currentAlgorithm) {
        case "首次适应":
          this.allocator = new FirstFitAllocator(this.totalMemory);
          break;
        case "最佳适应":
          this.allocator = new BestFitAllocator(this.totalMemory);
          break;
        case "最坏适应":
          this.allocator = new WorstFitAllocator(this.totalMemory);
          break;
      }
      this.freeSpaces = [{ start: 0, length: this.totalMemory }];
      this.tasks = [];
      this.memoryLayout = [];
    },

    addTask() {
      if (this.newTask.name && this.newTask.size) {
        const task = {
          name: this.newTask.name,
          size: parseInt(this.newTask.size),
        };

        // 使用当前算法分配任务
        if (this.allocator.allocate(task)) {
          this.refreshMemoryState();
          this.$forceUpdate();
        } else {
          alert("没有足够的内存来分配任务");
        }

        this.newTask.name = "";
        this.newTask.size = "";
      }
    },

    reclaimMemory(taskName) {
      const taskToFree = this.tasks.find((task) => task.name === taskName);
      if (!taskToFree) {
        alert(`未找到任务: ${taskName}`);
        return;
      }

      if (this.allocator.free(taskToFree.name)) {
        this.refreshMemoryState();
        console.log(`成功回收任务: ${taskToFree.name}`);
      } else {
        console.error(`无法回收任务: ${taskToFree.name}`);
      }
    },

    refreshMemoryState() {
      const freeSpaces = this.allocator.getFreeList();
      const tasks = this.allocator.getTasks();

      this.memoryLayout = [...tasks, ...freeSpaces].sort(
        (a, b) => a.start - b.start
      );

      // 也可以刷新空闲表和任务表
      this.freeSpaces = [...freeSpaces];
      this.tasks = [...tasks];

      console.log("内存布局更新:", this.memoryLayout);
    },

    switchAlgorithm() {
      this.currentAlgorithmIndex =
        (this.currentAlgorithmIndex + 1) % this.algorithms.length;
      this.currentAlgorithm = this.algorithms[this.currentAlgorithmIndex];
    },

    resetMemory() {
      if (confirm("确定要重置内存吗？")) {
        this.initializeAllocator();
      }
    },

    mounted() {
      this.initializeAllocator();
      this.allocator = new FirstFitAllocator(100);
      this.refreshMemoryState();
    },
  },

  watch: {
    task: {
      deep: true,
      handler(newTasks, oldTasks) {
        if (newTasks.length > 0) {
          this.refreshMemoryState();
        }
      },
    },
  },
};
</script>

<style scoped>
.memory-management {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  margin: 20px;
}

.task-manager,
.memory-layout,
.system-status,
.free-table,
.task-table {
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.memory-blocks {
  display: flex;
  flex-direction: column;
  height: 300px; /* 设置一个固定高度，或者根据需要调整 */
  overflow-y: auto; /* 如果内容超出，允许垂直滚动 */
}

.memory-block {
  width: 100%;
  min-height: 30px;
  background-color: lightgreen;
  margin-bottom: 5px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input,
button {
  display: block;
  margin-bottom: 10px;
}

button {
  cursor: pointer;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 5px;
  text-align: center;
}

th {
  background-color: #e9ecef;
}
</style>
