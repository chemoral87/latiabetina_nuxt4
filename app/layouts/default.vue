<template>
  <VApp >
    <VNavigationDrawer id="layout-nav-drawer" v-model="drawer" temporary app touchless>
      <VList>
        <VListItem>
          <VListItemTitle>Latiabetina</VListItemTitle>
        </VListItem>
        <ClientOnly>
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
        </ClientOnly>
        <ClientOnly>
          <template v-if="auth.loggedIn">
            <VDivider />
            <VListItem to="/account" prepend-icon="mdi-account" @click="drawer = false">
              <VListItemTitle>Mi Perfil</VListItemTitle>
            </VListItem>
            <VListItem to="/logout" prepend-icon="mdi-logout" @click="drawer = false">
              <VListItemTitle>Cerrar Sesión</VListItemTitle>
            </VListItem>
          </template>
        </ClientOnly>
      </VList>
    </VNavigationDrawer>

    <VAppBar id="layout-app-bar" elevation="2" fixed app>
      <VAppBarNavIcon v-if="showDrawer" id="layout-nav-icon" @click.stop="drawer = !drawer" />
      <VBtn v-if="backRoute" id="btn-layout-back" icon variant="outlined" rounded="circle" size="small" class="mx-2" @click="handleBack">
        <VIcon size="x-large">mdi-arrow-left</VIcon> 
      </VBtn>
      <VIcon v-if="icon" class="mr-0">{{ icon }}</VIcon>
      <VToolbarTitle id="layout-title" class="mx-1 pl-0">{{ title }}</VToolbarTitle>
      <VSpacer />
      <ClientOnly>
        <VBtn v-if="!auth.loggedIn && showLogin" id="layout-login-btn" icon @click="gotoLogin">
          <VIcon>mdi-lock</VIcon>
        </VBtn>
      </ClientOnly>
      <ClientOnly>
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
      </ClientOnly>
    </VAppBar>

    <VMain>
      <VProgressLinear v-if="isLoading" indeterminate color="primary" class="global-progress" style="position: fixed; top: 0; left: 0; right: 0; z-index: 2000;" />
      <slot />

      <div class="snackbar-wrapper">
        <VSnackbar
          v-for="(snack, i) in notify.snacks"
          :key="snack.id"
          model-value
          :color="snack.color"
          content-class="snack-content"
          location="bottom end"
          absolute
          :timeout="-1"
          :style="{ bottom: `${i * 69}px` }"
        >
          <span class="text-subtitle-1 font-weight-bold">{{ snack.text }}</span>
          <template #actions>
            <VBtn id="btn-layout-snack-close" color="grey" icon size="small" @click="notify.closeSnackbar(snack.id)">
              <VIcon>mdi-close</VIcon>
            </VBtn>
          </template>
        </VSnackbar>
      </div>
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
import { MenuService } from "~/services/menu-service"

const route = useRoute()
const drawer = ref(false)
const menu = ref(false)
const showLogin = ref(true)

const { isLoading, endNavigation } = useGlobalProgress()

onNuxtReady(() => {
  endNavigation()
})

const auth = useAuthStore()
const notify = useNotifyStore()
const title = computed(() => (route.meta?.title as string) || "Latiabetina")
const showDrawer = computed(() => route.meta?.showDrawer ?? true)
const backRoute = computed(() => route.meta?.back as string | undefined)
const icon = computed(() => route.meta?.icon as string | undefined)
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

function handleBack() {
  if (backRoute.value) {
    navigateTo(backRoute.value)
  }
}
</script>
