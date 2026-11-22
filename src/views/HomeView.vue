<script setup>
import MainLayout from "../components/layouts/MainLayout.vue";
import HeroSection from "../sections/home/HeroSection.vue";
import AboutTefa from "../sections/home/AboutTefa.vue";
import FeaturedProducts from "../sections/home/FeaturedProducts.vue";
import StatsSection from "../sections/home/StatsSection.vue";
import Testimonials from "../sections/home/Testimonials.vue";
import CtaSection from "../sections/home/CtaSection.vue";
</script>

<template>
  <MainLayout>
    <HeroSection />
    <AboutTefa />
    <FeaturedProducts />
    <StatsSection />
    <Testimonials />
    <CtaSection />
  </MainLayout>
</template>