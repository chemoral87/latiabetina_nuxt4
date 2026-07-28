<template>
  <VApp class="bg-grey-darken-3">
    <VNavigationDrawer id="layout-nav-drawer" v-model="drawer" temporary app touchless>
      <VList>
        <VListItem>
          <VListItemTitle>Latiabetina</VListItemTitle>
        </VListItem>
        <template v-for="(item, i) in items" :key="i">
          <VListGroup v-if="item.children" :value="false" :prepend-icon="item.icon">
            <template #activator="{ props }">
              <VListItem v-bind="props">
                <VListItemTitle>{{ item.title }}</VListItemTitle>
              </VListItem>
            </template>
            <VListItem v-for="(child, j) in item.children" :key="`child-${j}`" :to="child.to" router exact @click="drawer = false">
              <template #prepend>
                <VIcon size="small">{{ child.icon || 'mdi-circle-small' }}</VIcon>
              </template>
              <VListItemTitle>{{ child.title }}</VListItemTitle>
            </VListItem>
          </VListGroup>
          <VListItem v-else :to="item.to" router exact :prepend-icon="item.icon" @click="drawer = false">
            <VListItemTitle>{{ item.title }}</VListItemTitle>
          </VListItem>
        </template>
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
          <VBtn id="btn-layout-account" class="mr-3" size="small" color="blue" variant="flat" icon v-bind="props">
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
import { MenuService } from "~/services/menu-service"

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
  const menuService = new MenuService(auth.loggedIn, (perm) => auth.hasPermission(perm))
  return menuService.getMenu()
})

function gotoLogin() {
  navigateTo("/login")
}

function handleLogout() {
  menu.value = false
  navigateTo("/logout")
}
</script>
