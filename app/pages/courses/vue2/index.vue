<template>
  <CoursesQuizQuizPage
    icon="mdi-vuejs"
    title-en="Vue 2 Quiz"
    title-es="Vue 2 Quiz"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
    subtitle-en="Test your Vue 2 knowledge"
    subtitle-es="Pon a prueba tus conocimientos de Vue 2"
  />
</template>

<script setup lang="ts">
import questionsBasic from "./questions_basic.json"
import questionsIntermediate from "./questions_intermediate.json"
import questionsExpert from "./questions_expert.json"

definePageMeta({
  title: "Vue 2 Quiz",
  icon: "mdi-vuejs",
})

const questionsEn = [
  ...normalizeQuestions(questionsBasic as RawQuestion[], "en"),
  ...normalizeQuestions(questionsIntermediate as RawQuestion[], "en"),
  ...normalizeQuestions(questionsExpert as RawQuestion[], "en"),
]

const questionsEs = [
  ...normalizeQuestions(questionsBasic as RawQuestion[], "es"),
  ...normalizeQuestions(questionsIntermediate as RawQuestion[], "es"),
  ...normalizeQuestions(questionsExpert as RawQuestion[], "es"),
]
</script>
