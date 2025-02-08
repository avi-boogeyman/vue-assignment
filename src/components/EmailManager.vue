<script setup>
import { ref, computed, watch } from "vue";
import { Input, Button, Collapse, message, Tree } from "ant-design-vue";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Email List
const emailList = ref([
  { email: "ann@timescale.com", isSelected: false },
  { email: "bob@timescale.com", isSelected: false },
  { email: "brian@qwerty.com", isSelected: true },
  { email: "james@qwerty.com", isSelected: false },
  { email: "jane@awesome.com", isSelected: false },
  { email: "kate@qwerty.com", isSelected: true },
  { email: "mike@hello.com", isSelected: true }
]);

const searchInput = ref("");
const checkedKeys = ref([]);

// Generate Tree Structure
const treeData = computed(() => {
  const domainMap = new Map();

  emailList.value.forEach(({ email, isSelected }) => {
    const [name, domain] = email.split("@");

    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }

    const key = `${domain}-${name}`;
    domainMap.get(domain).push({ title: email, key, isSelected });

    if (isSelected) checkedKeys.value.push(key);
  });

  return Array.from(domainMap, ([domain, children]) =>
    children.length === 1
      ? children[0] // Show single emails directly
      : { title: domain, key: domain, children }
  );
});

// Filter Tree Data for Selected Recipients
const filteredTreeData = computed(() =>
  treeData.value
    .map(group => {
      if (checkedKeys.value.includes(group.key)) return group;

      if (group.children) {
        const selectedChildren = group.children.filter(child =>
          checkedKeys.value.includes(child.key)
        );
        return selectedChildren.length ? { ...group, children: selectedChildren } : null;
      }

      return null;
    })
    .filter(Boolean)
);

// Add New Email After Validation
const addEmail = () => {
  const email = searchInput.value.trim();
  if (!emailRegex.test(email)) {
    message.error("Invalid email format");
    return;
  }

  if (!emailList.value.some(e => e.email === email)) {
    emailList.value.push({ email, isSelected: false });
  }

  searchInput.value = "";
};

// Handle Selection in Tree
const updateSelection = (checked, node) => {
  const emailsToUpdate = node.children ? node.children.map(c => c.title) : [node.title];

  emailList.value.forEach(emailObj => {
    if (emailsToUpdate.includes(emailObj.email)) {
      emailObj.isSelected = checked;
    }
  });
};

const handleCheck = (newCheckedKeys, { checked, node }) => {
  updateSelection(checked, node);
  checkedKeys.value = newCheckedKeys;
};

const filteredTreeDataAll = computed(() => {
  if (!searchInput.value.trim()) return treeData.value; // Return all if no search query

  const filterNode = (node) => {
    if (node.title.toLowerCase().includes(searchInput.value.toLowerCase())) return true;
    if (node.children) {
      node.children = node.children.filter(filterNode); // Keep only matching children
      return node.children.length > 0;
    }
    return false;
  };

  return treeData.value
    .map(node => ({ ...node })) // Create a shallow copy to avoid mutating original data
    .filter(filterNode);
});

</script>

<template>
  <div class="p-10">
    <div class="flex flex-col gap-10 md:flex-row">
      <!-- Available Recipients -->
      <div class="flex-grow">
        <h3 class="underline">Available Recipients</h3>

        <div class="flex gap-2 mb-6 ">
          <Input v-model:value="searchInput" placeholder="Enter email" />
          <Button type="primary" @click="addEmail" :class="emailRegex.test(searchInput)
            ? 'visible'
            : 'invisible'">
            Add
          </Button>
        </div>

        <Tree v-model:checkedKeys="checkedKeys" :tree-data="filteredTreeDataAll" checkable defaultExpandAll
          :filterTreeNode="node => searchInput && node.title.includes(searchInput)" @check="handleCheck"
          :selectable="false">
          <template #title="{ title }">
            <span>{{ title }}</span>
          </template>
        </Tree>
      </div>

      <!-- Selected Recipients -->
      <div class="flex-grow">
        <h3 class="underline">Selected Recipients</h3>

        <Collapse>
          <Collapse.Panel header="Company Recipients">
            <Tree v-if="filteredTreeData.some(elm => elm.children)" v-model:checkedKeys="checkedKeys"
              :tree-data="filteredTreeData.filter(elm => elm.children)" checkable defaultExpandAll autoExpandParent
              @check="handleCheck" :selectable="false">
              <template #title="{ title }">
                <span>{{ title }}</span>
              </template>
            </Tree>
            <p v-else class="text-center">No company recipients selected.</p>
          </Collapse.Panel>

          <Collapse.Panel header="Email Recipients">
            <Tree v-if="treeData.some(elm => elm.isSelected && !elm.children)" v-model:checkedKeys="checkedKeys"
              :tree-data="treeData.filter(elm => elm.isSelected && !elm.children)" checkable defaultExpandAll
              @check="handleCheck" :selectable="false">
              <template #title="{ title }">
                <span>{{ title }}</span>
              </template>
            </Tree>
            <p v-else class="text-center">No email recipients selected.</p>
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  </div>
</template>
