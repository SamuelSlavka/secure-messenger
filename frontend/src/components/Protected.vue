<template>
  <div class="protected">
    <userlist />
  </div>
</template>

<script>
import userlist from './UserList.vue';

export default {
  name: 'Home',
  components: {
    userlist,
  },
};
</script>
