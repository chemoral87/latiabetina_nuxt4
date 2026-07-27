<template>
  <VApp>
    <VNavigationDrawer v-model="drawer" temporary app touchless>
      <VList>
        <VListItem>
          <VListItemTitle>Latiabetina</VListItemTitle>
        </VListItem>
        <VListItem v-for="(item, i) in items" :key="i" :to="item.to" router exact @click="drawer = false">
          <VListItemAction>
            <VIcon>{{ item.icon }}</VIcon>
          </VListItemAction>
          <VListItemContent>
            <VListItemTitle>{{ item.title }}</VListItemTitle>
          </VListItemContent>
        </VListItem>
      </VList>
    </VNavigationDrawer>

    <VAppBar elevation="2" fixed app>
      <VAppBarNavIcon @click.stop="drawer = !drawer" />
      <VToolbarTitle>{{ title }}</VToolbarTitle>
      <VSpacer />
      <VBtn icon @click="gotoLogin">
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
