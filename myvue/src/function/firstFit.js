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

export default class FirstFitAllocator {
  constructor(totalMemory) {
    this.totalMemory = totalMemory;
    this.freeList = [new MemoryBlock(0, totalMemory)]; // 初始空闲块 = 总内存
    this.taskList = [];
    this.allocatedTasks = [];
  }

  allocate(task) {
    // console.log("尝试分配任务:", task);

    for (let i = 0; i < this.freeList.length; i++) {
      const block = this.freeList[i];
      if (block.size >= task.size) {
        console.log(
          `找到合适的空闲块: ${block.start} 到 ${block.start + block.size}`
        );

        const newTask = new Task(task.name, task.size);
        newTask.start = block.start;
        newTask.allocated = true;
        newTask.status = "已分配";
        this.taskList.push(newTask);
        this.allocatedTasks.push(newTask);

        if (block.size === task.size) {
          this.freeList.splice(i, 1);
        } else {
          block.start += task.size;
          block.size -= task.size;
        }

        // 刷新内存状态
        this.mergeFreeList();
        return true;
      }
    }
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

    // console.log("任务已释放:", taskName);

    //将释放的空间加入 freeList
    this.freeList.push({
      start: task.start,
      size: task.size,
    });

    //重新排序 freeList，确保空闲块合并
    this.mergeFreeList();

    task.status = "已释放";

    // //让 Vue 监听数据变化
    this.allocatedTasks = [...this.allocatedTasks];
    this.memoryLayout = [...this.allocatedTasks];
    this.freeList = [...this.freeList];
    this.taskList = [...this.taskList];

    // console.log(`Freed task:`, JSON.stringify(task));
    return true;
  }

  mergeFreeList() {
    this.freeList.sort((a, b) => a.start - b.start);
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
