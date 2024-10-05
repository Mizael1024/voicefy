<template>
  <div class="flex items-center justify-between">
    <p>Overview (Demo page)</p>
    <USelectMenu size="md" v-model="selected" :options="filters" />
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="rounded-lg border border-gray-200 dark:border-white/10 p-4 overflow-hidden relative space-y-4"
    >
      <div class="flex items-center justify-between">
        <p class="text-xs uppercase font-semibold tracking-wide">{{ stat.title }}</p>
        <p class="text-xs uppercase text-gray-500">LAST 30 DAYS</p>
      </div>
      <div class="flex items-end justify-between">
        <p class="text-3xl font-bold">{{ stat.value }}</p>
        <p :class="['text-sm', stat.percentageClass]">{{ stat.percentage }}</p>
      </div>
      <UProgress :value="stat.progressValue" :color="stat.progressColor" />
    </div>
    <div class="col-span-full border border-gray-200 dark:border-white/10 rounded-lg">
      <UTable :rows="orders" :columns="columns">
        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(row.status)" variant="subtle">
            {{ row.status }}
          </UBadge>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup>
const filters = ["Last Week", "Last Month", "30 Days", "1 Month", "3 Months"];
const selected = ref(filters[2]);

const stats = [
  {
    title: "SALES",
    value: "$48,442",
    percentage: "+12.1%",
    percentageClass: "text-green-600 dark:text-green-400",
    progressValue: 82,
    progressColor: "green",
  },
  {
    title: "ORDERS",
    value: "892",
    percentage: "-4.7%",
    percentageClass: "text-rose-600 dark:text-rose-400",
    progressValue: 40,
    progressColor: "rose",
  },
  {
    title: "EXPENSES",
    value: "$1,442",
    percentage: "+18.6%",
    percentageClass: "text-green-600 dark:text-green-400",
    progressValue: 82,
    progressColor: "green",
  },
];

const orders = [
  {
    orderId: 98382,
    name: "Nike Air Jordan 1",
    qty: 2,
    price: "$150.99",
    email: "lindsay.walton@shoesandmore.com",
    status: "Shipped",
  },
  {
    orderId: 42987,
    name: "Adidas Ultraboost",
    qty: 1,
    price: "$189.99",
    email: "michael.scott@dundermifflin.com",
    status: "Shipped",
  },
  {
    orderId: 57394,
    name: "Levi's 501 Original Jeans",
    qty: 1,
    price: "$69.99",
    email: "pam.beesly@dundermifflin.com",
    status: "Ready to ship",
  },
  {
    orderId: 12398,
    name: "Sony WH-1000XM4 Headphones",
    qty: 1,
    price: "$299.99",
    email: "jim.halpert@dundermifflin.com",
    status: "In Transit",
  },
  {
    orderId: 24323,
    name: "Apple Watch Series 6",
    qty: 1,
    price: "$399.99",
    email: "ryan.howard@tempagency.com",
    status: "Returned",
  },
  {
    orderId: 68324,
    name: "Ray-Ban Wayfarer Sunglasses",
    qty: 1,
    price: "$99.99",
    email: "angela.martin@catsgalore.com",
    status: "Shipped",
  },
  {
    orderId: 39482,
    name: "Samsung Galaxy S21",
    qty: 1,
    price: "$799.99",
    email: "dwight.schrute@shrutefarms.com",
    status: "Ready to ship",
  },
  {
    orderId: 75829,
    name: "Amazon Echo Dot (4th Gen)",
    qty: 3,
    price: "$49.99",
    email: "kevin.malone@dundermifflin.com",
    status: "In Transit",
  },
  {
    orderId: 19482,
    name: "Herschel Supply Co. Backpack",
    qty: 1,
    price: "$89.99",
    email: "oscar.martinez@accounting.com",
    status: "Delivered",
  },
  {
    orderId: 38591,
    name: "Fitbit Versa 2",
    qty: 1,
    price: "$149.99",
    email: "stanley.hudson@dundermifflin.com",
    status: "In Transit",
  },
];

const columns = [
  { key: "orderId", label: "Order ID" },
  { key: "name", label: "Product Name" },
  { key: "qty", label: "Quantity" },
  { key: "price", label: "Price" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const rows = orders.map((order) => ({
  orderId: order.orderId,
  name: order.name,
  qty: order.qty,
  price: order.price,
  email: order.email,
  status: order.status,
}));

function getStatusColor(status) {
  const colors = {
    Shipped: "green",
    "In Transit": "sky",
    Delivered: "green",
    Returned: "rose",
    "Ready to ship": "indigo",
  };
  return colors[status] || "gray";
}
</script>
