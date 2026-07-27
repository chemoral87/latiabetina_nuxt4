<template>
  <VApp>
    <VNavigationDrawer id="layout-nav-drawer" v-model="drawer" temporary app touchless>
      <VList>
        <VListItem>
          <VListItemTitle>Latiabetina</VListItemTitle>
        </VListItem>
        <VListItem v-for="(item, i) in items" :key="i" :to="item.to" router exact :prepend-icon="item.icon" @click="drawer = false">
          <VListItemTitle>{{ item.title }}</VListItemTitle>
        </VListItem>
      </VList>
    </VNavigationDrawer>

    <VAppBar id="layout-app-bar" elevation="2" fixed app>
      <VAppBarNavIcon id="layout-nav-icon" @click.stop="drawer = !drawer" />
      <VToolbarTitle id="layout-title">{{ title }}</VToolbarTitle>
      <VSpacer />
      <VBtn id="layout-login-btn" icon @click="gotoLogin">
        <VIcon>mdi-lock</VIcon>
      </VBtn>
    </VAppBar>

    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const route = useRoute()
const drawer = ref(false)
const title = computed(() => route.meta?.title || "Latiabetina")

const items = [
  { title: "Inicio", icon: "mdi-home", to: "/" },
  { title: "Login", icon: "mdi-lock", to: "/login" },
]

function gotoLogin() {
  navigateTo("/login")
}
</script>
