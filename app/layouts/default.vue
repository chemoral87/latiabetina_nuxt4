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
        <template v-if="auth.loggedIn">
          <VDivider />
          <VListItem to="/account" prepend-icon="mdi-account" @click="drawer = false">
            <VListItemTitle>Mi Perfil</VListItemTitle>
          </VListItem>
          <VListItem to="/logout" prepend-icon="mdi-logout" @click="drawer = false">
            <VListItemTitle>Cerrar Sesión</VListItemTitle>
          </VListItem>
        </template>
      </VList>
    </VNavigationDrawer>

    <VAppBar id="layout-app-bar" elevation="2" fixed app>
      <VAppBarNavIcon id="layout-nav-icon" @click.stop="drawer = !drawer" />
      <VToolbarTitle id="layout-title">{{ title }}</VToolbarTitle>
      <VSpacer />
      <VBtn v-if="!auth.loggedIn && showLogin" id="layout-login-btn" icon @click="gotoLogin">
        <VIcon>mdi-lock</VIcon>
      </VBtn>
      <VMenu v-if="auth.loggedIn" v-model="menu" offset-y>
        <template #activator="{ props }">
          <VBtn id="btn-layout-account" class="ml-3" size="small" color="blue" variant="flat" icon v-bind="props">
            <VIcon color="white">mdi-account</VIcon>
          </VBtn>
        </template>
        <VList>
          <VListItem to="/account">
            <VListItemTitle>{{ userName }}</VListItemTitle>
            <VListItemSubtitle>{{ userEmail }}</VListItemSubtitle>
          </VListItem>
          <VDivider />
          <VListItem @click="handleLogout">
            <VListItemTitle>
              <VIcon>mdi-logout</VIcon>
              Cerrar Sesión
            </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VAppBar>

    <VMain>
      <slot />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
const route = useRoute()
const drawer = ref(false)
const menu = ref(false)
const showLogin = ref(true)

const auth = useAuthStore()
const title = computed(() => route.meta?.title || "Latiabetina")
const userName = computed(() => {
  const u = auth.user
  if (!u) return ""
  return `${u.name || ""} ${u.last_name || ""}`.trim() || "Usuario"
})
const userEmail = computed(() => auth.user?.email || "")

const items = computed(() => {
  const list = [{ title: "Inicio", icon: "mdi-home", to: "/" }]
  return list
})

function gotoLogin() {
  navigateTo("/login")
}

function handleLogout() {
  menu.value = false
  navigateTo("/logout")
}
</script>
