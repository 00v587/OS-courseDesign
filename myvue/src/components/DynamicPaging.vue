<template>
  <div class="container">
    <!-- 左侧部分：内存设置和指令输入 -->
    <div class="left-panel">
      <div class="memory-settings">
        <h3>内存设置</h3>
        <div>
          <label>内存大小(KB)：</label>
          <input v-model="memorySize" type="number" />
        </div>
        <div>
          <label>内存块大小(KB)：</label>
          <input v-model="blockSize" type="number" />
        </div>
        <div>
          <label>分配给任务的内存块数：</label>
          <input v-model="allocatedMemoryBlocks" type="number" />
          <button @click="generateMemoryBlocks">生成内存块</button>
        </div>
      </div>

      <div class="instructions">
        <h3>添加指令</h3>
        <form @submit.prevent="addInstruction">
          <div>
            <label>操作：</label>
            <input v-model="newInstruction.operation" />
          </div>
          <div>
            <label>页号：</label>
            <input v-model="newInstruction.pageNumber" type="number" />
          </div>
          <div>
            <label>页内地址：</label>
            <input v-model="newInstruction.offset" type="number" />
          </div>
          <button type="submit">添加指令</button>
        </form>
      </div>

      <div class="operations">
        <h3>操作</h3>
        <table>
          <tr>
            <th>序号</th>
            <th>操作</th>
            <th>页号</th>
            <th>页内地址</th>
          </tr>
          <tr v-for="(instruction, index) in instructions" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ instruction.operation }}</td>
            <td>{{ instruction.pageNumber }}</td>
            <td>{{ instruction.offset }}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- 右侧部分：页表显示和内存块 -->
    <div class="right-panel">
      <div class="page-table">
        <h3>页表</h3>
        <table>
          <tr>
            <th>页号</th>
            <th>标志</th>
            <th>内存块号</th>
            <th>修改标志</th>
            <th>磁盘位置</th>
          </tr>
          <tr v-for="(page, index) in pageTable" :key="index">
            <td>{{ page.pageNumber }}</td>
            <td>{{ page.flag }}</td>
            <td>{{ page.memoryBlock }}</td>
            <td>{{ page.modified ? "是" : "否" }}</td>
            <td>{{ page.diskPosition }}</td>
          </tr>
        </table>
      </div>

      <div class="memory-blocks">
        <h3>内存块</h3>
        <div
          v-for="(block, index) in memoryBlocks"
          :key="index"
          class="memory-block"
          :style="{ backgroundColor: block.color }"
        >
          <span>{{ block.index }} ({{ block.status }})</span>
        </div>
      </div>

      <div class="page-fault">
        <h3>缺页中断记录</h3>
        <table>
          <tr>
            <th>序号</th>
            <th>物理地址</th>
            <th>缺页情况</th>
            <th>调入内存块</th>
            <th>淘汰</th>
          </tr>
          <tr v-for="(entry, index) in pageFaultTable" :key="index">
            <td>{{ entry.index }}</td>
            <td>{{ entry.physicalAddress }}</td>
            <td>{{ entry.pageFault ? "缺页" : "不缺页" }}</td>
            <td>{{ entry.memoryBlock }}</td>
            <td>
              {{
                entry.replacedPageNumber
                  ? `页号 ${entry.replacedPageNumber}`
                  : "无"
              }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      memorySize: 64,
      blockSize: 1,
      allocatedMemoryBlocks: 4,
      memoryBlocks: [],
      pageTable: [],
      pageFaultTable: [],
      newInstruction: {
        operation: "",
        pageNumber: null,
        offset: null,
      },
      instructions: [],
    };
  },
  methods: {
    generateMemoryBlocks() {
      const totalBlocks = this.memorySize / this.blockSize;
      const allocatedBlocks = this.allocatedMemoryBlocks;

      let randomIndexes = [];
      while (randomIndexes.length < allocatedBlocks) {
        let rand = Math.floor(Math.random() * totalBlocks);
        if (!randomIndexes.includes(rand)) {
          randomIndexes.push(rand);
        }
      }

      this.memoryBlocks = randomIndexes.map((index) => ({
        index,
        status: "空闲",
        color: "white", // 初始颜色为白色
      }));
      // 动画效果：开始计时器并更新颜色
      this.animateMemoryBlocks();
    },
    addInstruction() {
      //填充指令表
      this.instructions.push({
        operation: this.newInstruction.operation,
        pageNumber: this.newInstruction.pageNumber,
        offset: this.newInstruction.offset,
      });

      const pageNumber = this.newInstruction.pageNumber;
      let page = this.pageTable.find((p) => p.pageNumber === pageNumber);

      if (!page) {
        // 如果该页没有在页表中，生成新的页表项
        page = {
          pageNumber,
          flag: 0, // 初始标志为0，表示不在内存中
          memoryBlock: null,
          modified: false,
          diskPosition: `Disk${pageNumber}`,
        };
        this.pageTable.push(page);
      }

      // 根据指令类型设置“是否修改”标志
      if (
        this.newInstruction.operation === "+" ||
        this.newInstruction.operation === "-" ||
        this.newInstruction.operation === "*" ||
        this.newInstruction.operation === "/"
      ) {
        page.modified = true; // 加法或减法操作需要修改页面内容
      } else {
        page.modified = false; // save 或 load 操作不修改页面内容
      }

      // 如果页不在内存中
      if (page.flag === 0) {
        let availableBlock = this.memoryBlocks.find(
          (block) => block.status === "空闲"
        );
        if (availableBlock) {
          // 如果有空闲内存块，调入该页
          page.memoryBlock = availableBlock.index;
          page.flag = 1;
          availableBlock.status = "已分配";
          this.pageFaultTable.push({
            index: this.pageFaultTable.length + 1,
            physicalAddress: this.calculatePhysicalAddress(
              page.memoryBlock,
              this.newInstruction.offset
            ),
            pageFault: true,
            memoryBlock: availableBlock.index,
          });
        } else {
          // 如果没有空闲内存块，缺页中断，进行页面置换（FIFO）
          this.handlePageFault(page);
        }
      } else {
        // 如果页在内存中，更新最后访问时间，并不触发缺页中断
        page.lastAccessedTime = new Date().getTime();

        // 记录缺页中断
        this.pageFaultTable.push({
          index: this.pageFaultTable.length + 1,
          physicalAddress: this.calculatePhysicalAddress(
            page.memoryBlock,
            this.newInstruction.offset
          ),
          pageFault: false, // 这里表示没有缺页中断
          memoryBlock: page.memoryBlock,
        });

        // 页面置换动画
        this.animateMemoryBlocks();
      }

      // 清空输入框，防止数据重复
      this.newInstruction.operation = "";
      this.newInstruction.pageNumber = null;
      this.newInstruction.offset = null;

    },
    handlePageFault(page) {
      alert(`缺页中断：内存块已满，无法调入页号 ${page.pageNumber}`);

      // 获取最早加载的页面（FIFO）
      const oldestPage = this.pageTable.find(
        (p) => p.memoryBlock === this.memoryBlocks[0].index
      );

      // 置换页面
      if (oldestPage) {
        const memoryBlockToUse = this.memoryBlocks[0].index;
        const pageToUse = oldestPage.pageNumber;

        // 将该页面标记为不在内存中
        oldestPage.flag = 0;
        oldestPage.memoryBlock = null;

        // 释放内存块
        const blockToRelease = this.memoryBlocks.find(
          (block) => block.index === oldestPage.memoryBlock
        );
        if (blockToRelease) {
          blockToRelease.status = "空闲";
        }

        // 加载新页面
        page.memoryBlock = memoryBlockToUse;
        page.flag = 1;
        this.memoryBlocks[0].status = "已分配"; // 将内存块状态设置为已分配
        this.memoryBlocks.push(this.memoryBlocks.shift()); // 将内存块队列向前移动

        // 记录缺页中断
        this.pageFaultTable.push({
          index: this.pageFaultTable.length + 1,
          physicalAddress: this.calculatePhysicalAddress(
            page.memoryBlock,
            this.newInstruction.offset
          ),
          pageFault: true,
          memoryBlock: memoryBlockToUse,
          replacedPageNumber: pageToUse,
        });
      }
    },
    calculatePhysicalAddress(memoryBlock, offset) {
      return 1024 * memoryBlock * this.blockSize + offset;
    },
    animateMemoryBlocks() {
      let timer = setInterval(() => {
        this.memoryBlocks.forEach((block) => {
          if (block.status === "已分配") {
            block.lastAccessedTime++;
            block.color = this.calculateColorBasedOnTime(block);
          }
        });
      }, 1000);
    },
    calculateColorBasedOnTime(block) {
      let timeSpent = block.lastAccessedTime;
      let colorValue = Math.min(255, timeSpent * 5);
      return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  margin: 20px;
}

.left-panel,
.right-panel {
  width: 48%;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.memory-block {
  width: 50px;
  height: 50px;
  margin: 5px;
  display: inline-block;
  background-color: white;
  text-align: center;
  transition: background-color 1s ease;
}

table {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  display: block;
}

th,
td {
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
}
</style>
