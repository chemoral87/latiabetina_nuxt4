<template>
  <CoursesQuizQuizPage
    icon="mdi-nodejs"
    title-en="Node.js Quiz"
    subtitle-en="Test your Node.js knowledge"
    title-es="Node.js Quiz"
    subtitle-es="Pon a prueba tus conocimientos de Node.js"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script setup lang="ts">
import questionsBasic from "./questions_basic.json"
import questionsIntermediate from "./questions_intermediate.json"
import questionsExpert from "./questions_expert.json"

definePageMeta({
  title: "Node.js Quiz",
  icon: "mdi-nodejs",
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
