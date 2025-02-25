class MemoryBlock {
    constructor(start, size) {
      this.start = start;
      this.size = size;
    }
  }
  
  class Task {
    constructor(name, size) {
      this.name = name;
      this.size = size;
      this.start = -1; // -1 表示未分配
      this.allocated = false;
      this.status = "未分配";
    }
  }
  
  class Allocator {
    constructor() {
      this.allocatedTasks = [];
      this.free = this.free.bind(this); // 确保 `this` 绑定正确
    }
  }
  
  export default class bestFitAllocator {
    constructor(totalMemory) {
      this.totalMemory = totalMemory;
      this.freeList = [new MemoryBlock(0, totalMemory)]; // 初始空闲块 = 总内存
      this.taskList = [];
      this.allocatedTasks = [];
    }
  
    //最坏适应算法
    allocate(task) {
      // console.log("尝试分配任务:", task);
      this.freeList.sort((a, b) => a.size - b.size);
      this.freeList.reverse();
      for (let i = 0; i < this.freeList.length; i++) {
        const block = this.freeList[i];
        if (block.size >= task.size) {
          // 找到合适的空��块，分割并添加到 freeList
          task.start = block.start;
          task.allocated = true;
          task.status = "已分配";
          this.allocatedTasks.push(task);
  
          if (block.size === task.size) {
            this.freeList.splice(i, 1);
          } else {
            block.start += task.size;
            block.size -= task.size;
          }
  
          this.taskList.push(task);
          this.updateMemoryLayout();
          return true;
        }
      }
      console.error(`Task ${task.name} cannot be allocated`);
      return false;
    }
  
    free(taskName) {
      // console.log("尝试释放任务:", taskName);
  
      const index = this.allocatedTasks.findIndex(
        (task) => task.name === taskName
      );
      if (index === -1) {
        console.error(`Task ${taskName} not found`);
        return false;
      }
  
      const task = this.allocatedTasks[index];
      this.allocatedTasks.splice(index, 1);
      task.status = "已释放";
      // console.log("任务已释放:", taskName);
  
      //将释放的空间加入 freeList
      this.freeList.push({
        start: task.start,
        size: task.size,
      });
  
      //重新排序 freeList，确保空闲块合并
      this.mergeFreeList();
      this.freeList.sort((a, b) => a.size - b.size);
      this.freeList.reverse();
      this.updateMemoryLayout();
  
      // //让 Vue 监听数据变化
      this.allocatedTasks = [...this.allocatedTasks];
      
      // console.log(`Freed task:`, JSON.stringify(task));
      return true;
    }
  
    mergeFreeList() {
      this.freeList.sort((a, b) => a.start - b.start);
    //   this.freeList.reverse();
      const merged = [];
      for (const block of this.freeList) {
        if (
          merged.length > 0 &&
          merged[merged.length - 1].start + merged[merged.length - 1].size ===
            block.start
        ) {
          merged[merged.length - 1].size += block.size;
        } else {
          merged.push(block);
        }
      }
      this.freeList = merged;
    }
  
    updateMemoryLayout() {
      this.memoryLayout = [...this.allocatedTasks];
      this.freeList = [...this.freeList];
      this.taskList = [...this.taskList];
    }
  
    getFreeList() {
      return this.freeList.map((block) => ({
        start: block.start,
        length: block.size,
      }));
    }
  
    getTasks() {
      return this.taskList.map((task) => ({
        name: task.name,
        start: task.start,
        size: task.size,
        status: task.status,
      }));
    }
  }
  