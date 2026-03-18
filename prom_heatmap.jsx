import { useState, useMemo, useRef, useCallback } from "react";
import * as XLSX from "sheetjs";

const INITIAL_DATA = {"q":[{"id":"5171","short":"Urinverlust Häufigkeit","domain":"Harn","scale":"freq_inv"},{"id":"5172","short":"Harnkontrolle","domain":"Harn","scale":"control_inv"},{"id":"5173","short":"Einlagen/Tag","domain":"Harn","scale":"pads"},{"id":"5174","short":"Tröpfeln/Urinverlust","domain":"Harn","scale":"problem"},{"id":"5175","short":"Schmerzen Wasserlassen","domain":"Harn","scale":"problem"},{"id":"5176","short":"Blut im Urin","domain":"Harn","scale":"problem"},{"id":"5177","short":"Schwacher Harnstrahl","domain":"Harn","scale":"problem"},{"id":"5178","short":"Häufiger Harndrang","domain":"Harn","scale":"problem"},{"id":"5179","short":"Wasserlassen gesamt","domain":"Harn","scale":"problem"},{"id":"5180","short":"Stuhldrang","domain":"Darm","scale":"problem"},{"id":"5181","short":"Vermehrter Stuhlgang","domain":"Darm","scale":"problem"},{"id":"5182","short":"Stuhlkontrolle Verlust","domain":"Darm","scale":"problem"},{"id":"5183","short":"Blutiger Stuhl","domain":"Darm","scale":"problem"},{"id":"5184","short":"Bauch/Becken Schmerzen","domain":"Darm","scale":"problem"},{"id":"5185","short":"Stuhlgang gesamt","domain":"Darm","scale":"problem"},{"id":"5186","short":"Erektionsfähigkeit","domain":"Sexual","scale":"function_inv"},{"id":"5187","short":"Orgasmusfähigkeit","domain":"Sexual","scale":"function_inv"},{"id":"5188","short":"Erektionsqualität","domain":"Sexual","scale":"erection_qual"},{"id":"5189","short":"Erektionshäufigkeit","domain":"Sexual","scale":"erection_freq"},{"id":"5190","short":"Sexuelle Funktion gesamt","domain":"Sexual","scale":"function_inv"},{"id":"5191","short":"Sexuelle Probleme","domain":"Sexual","scale":"problem"},{"id":"5192","short":"Hitzewallungen","domain":"Hormonal","scale":"problem"},{"id":"5193","short":"Empfindliche Brüste","domain":"Hormonal","scale":"problem"},{"id":"5194","short":"Niedergeschlagenheit","domain":"Hormonal","scale":"problem"},{"id":"5195","short":"Energiemangel","domain":"Hormonal","scale":"problem"},{"id":"5196","short":"Gewichtsveränderung","domain":"Hormonal","scale":"problem"},{"id":"EQ5D_101","short":"Mobilität","domain":"EQ-5D","scale":"eq5d"},{"id":"EQ5D_102","short":"Selbstversorgung","domain":"EQ-5D","scale":"eq5d"},{"id":"EQ5D_103","short":"Alltägliche Tätigkeiten","domain":"EQ-5D","scale":"eq5d"},{"id":"EQ5D_104","short":"Schmerzen/Beschwerden","domain":"EQ-5D","scale":"eq5d"},{"id":"EQ5D_105","short":"Angst/Niedergeschlagenheit","domain":"EQ-5D","scale":"eq5d"},{"id":"EQ5D_108","short":"Lebensqualität gesamt","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_109","short":"LQ bzgl. Erkrankung","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_110","short":"Zufriedenheit Kontinenz","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_111","short":"LQ Sexualität","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_112","short":"Partnerschaft","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_113","short":"Soziale Kontakte","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_114","short":"OP-Ergebnis Zufriedenheit","domain":"Lebensqualität","scale":"lq"},{"id":"EQ5D_115","short":"Betreuung Zufriedenheit","domain":"Lebensqualität","scale":"lq"}],"d":[{"p":"C428","n":"Hansjürg Mahler","z":"Eingabe vor Eintritt","d":"2020-05-14","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":3,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":4,"5186":3,"5187":3,"5188":3,"5189":2,"5190":3,"5191":4,"5192":1,"5193":1,"5194":1,"5195":3,"5196":2}},{"p":"C428","n":"Hansjürg Mahler","z":"Nachkontrolle (3 Monate)","d":"2020-07-20","a":{"5171":2,"5172":3,"5173":2,"5174":3,"5175":1,"5176":1,"5177":1,"5178":2,"5179":3,"5180":1,"5181":1,"5182":2,"5183":1,"5184":2,"5185":2,"5186":2,"5187":3,"5188":3,"5189":3,"5190":3,"5191":4,"5192":1,"5193":1,"5194":1,"5195":2,"5196":2}},{"p":"C428","n":"Hansjürg Mahler","z":"Nachkontrolle (2 Jahre)","d":"2022-03-01","a":{"5171":2,"5172":3,"5173":1,"5174":3,"5175":1,"5176":1,"5177":1,"5178":3,"5179":3,"5180":1,"5181":2,"5182":1,"5183":1,"5184":1,"5185":1,"5186":2,"5187":2,"5188":2,"5189":2,"5190":2,"5191":4,"5192":1,"5193":1,"5194":2,"5195":2,"5196":1}},{"p":"C428","n":"Hansjürg Mahler","z":"Nachkontrolle (5 Jahre)","d":"2026-03-10","a":{"5171":3,"5172":3,"5173":2,"5174":2,"5175":1,"5176":1,"5177":1,"5178":2,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":2,"5185":2,"5186":3,"5187":3,"5188":3,"5189":3,"5190":3,"5191":4,"5192":1,"5193":1,"5194":3,"5195":3,"5196":1}},{"p":"C2046","n":"C2046","z":"Eingabe vor Eintritt","d":"2021-03-16","a":{"5171":5,"5172":3,"5173":1,"5174":1,"5175":1,"5176":1,"5177":3,"5178":4,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":4,"5188":4,"5189":5,"5190":4,"5191":3,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C2046","n":"C2046","z":"Nachkontrolle (1 Jahr)","d":"2022-06-30","a":{"5171":5,"5172":4,"5173":2,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":1,"5188":1,"5189":1,"5190":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C2047","n":"C2047","z":"Eingabe vor Eintritt","d":"2021-03-16","a":{"5171":5,"5172":3,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":4,"5189":4,"5190":4,"5191":4,"5192":1,"5193":1,"5194":4,"5195":4,"5196":1}},{"p":"C2047","n":"C2047","z":"Nachkontrolle (1 Jahr)","d":"2022-10-18","a":{"5171":4,"5172":4,"5173":1,"5174":2,"5175":2,"5176":1,"5177":3,"5178":2,"5179":3,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":5,"5188":3,"5189":3,"5190":3,"5191":4,"5192":2,"5193":1,"5194":3,"5195":3,"5196":2}},{"p":"C2047","n":"C2047","z":"Nachkontrolle (2 Jahre)","d":"2023-04-04","a":{"5171":5,"5172":3,"5173":1,"5174":2,"5175":1,"5176":1,"5177":1,"5178":3,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":5,"5188":3,"5189":3,"5190":3,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C2047","n":"C2047","z":"Nachkontrolle (5 Jahre)","d":"2026-03-16","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":2,"5179":1,"5180":2,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":5,"5188":4,"5189":4,"5190":4,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C8046","n":"Rocco Leone","z":"Eingabe vor Eintritt","d":"2023-02-22","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":3,"5176":1,"5177":2,"5178":1,"5179":2,"5180":2,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":2,"5189":3,"5190":3,"5191":3,"5194":3,"5195":2,"5196":1}},{"p":"C8046","n":"Rocco Leone","z":"Nachkontrolle (3 Monate)","d":"2023-06-09","a":{"5171":1,"5172":1,"5173":4,"5174":5,"5175":1,"5176":1,"5177":1,"5178":1,"5179":5,"5180":4,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":2,"5188":2,"5189":1,"5190":1,"5191":2,"5192":1,"5193":1,"5194":2,"5195":1,"5196":2}},{"p":"C8066","n":"C8066","z":"Eingabe vor Eintritt","d":"2023-02-23","a":{"5171":2,"5172":3,"5173":1,"5174":2,"5175":1,"5176":1,"5177":1,"5178":3,"5179":2,"5180":1,"5181":2,"5182":1,"5183":1,"5184":1,"5185":2,"5186":5,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C8066","n":"C8066","z":"Nachkontrolle (3 Jahre)","d":"2026-03-16","a":{"5171":1,"5172":3,"5173":3,"5174":4,"5175":1,"5176":1,"5177":1,"5178":2,"5179":3,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":1,"5188":1,"5189":1,"5190":1,"5191":3,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C8334","n":"C8334","z":"Eingabe vor Eintritt","d":"2023-03-16","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":4,"5188":2,"5189":5,"5190":4,"5191":1,"5192":1,"5193":1,"5194":4,"5195":4,"5196":1}},{"p":"C8334","n":"C8334","z":"Nachkontrolle (3 Monate)","d":"2023-08-24","a":{"5171":1,"5172":1,"5173":4,"5174":5,"5175":1,"5176":1,"5177":1,"5178":3,"5179":5,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":1,"5188":1,"5189":1,"5190":1,"5191":5,"5192":5,"5193":1,"5194":5,"5195":5,"5196":4}},{"p":"C11785","n":"Branimir Andjelic","z":"Eingabe vor Eintritt","d":"2024-02-21","a":{"5171":5,"5172":4,"5173":1,"5179":1,"5185":1}},{"p":"C16723","n":"C16723","z":"Eingabe vor Eintritt","d":"2025-01-23","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":3,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":2,"5185":1,"5186":5,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":2,"5195":2,"5196":1}},{"p":"C16723","n":"C16723","z":"Nachkontrolle (1 Jahr)","d":"2026-03-09","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":3,"5176":1,"5177":3,"5178":1,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":2,"5185":1,"5186":3,"5187":4,"5188":3,"5189":3,"5190":3,"5191":3,"5192":1,"5193":1,"5194":2,"5195":2,"5196":3}},{"p":"C17182","n":"Helmut Mair","z":"Eingabe vor Eintritt","d":"2025-02-14","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":4,"5178":4,"5179":3,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":3,"5189":2,"5190":3,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C17342","n":"Leo Suter","z":"Eingabe vor Eintritt","d":"2025-03-06","a":{"5171":4,"5172":4,"5173":1,"5174":2,"5175":1,"5176":1,"5177":1,"5178":1,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":2,"5188":4,"5189":2,"5190":3,"5191":3,"5192":1,"5193":1,"5194":2,"5195":4,"5196":1}},{"p":"C17342","n":"Leo Suter","z":"Nachkontrolle (3 Monate)","d":"2025-06-21","a":{"5171":1,"5172":3,"5173":3,"5174":2,"5175":1,"5176":1,"5177":1,"5178":1,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":2,"5187":2,"5188":2,"5189":2,"5190":2,"5191":4,"5192":1,"5193":1,"5194":2,"5195":3,"5196":3}},{"p":"C17575","n":"Ernst Jetzer","z":"Eingabe vor Eintritt","d":"2025-03-19","a":{"5171":1,"5172":3,"5173":2,"5174":4,"5175":1,"5176":1,"5177":1,"5178":4,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":4,"5188":1,"5189":1,"5190":4,"5191":4}},{"p":"C17575","n":"Ernst Jetzer","z":"Nachkontrolle (1 Jahr)","d":"2026-03-02","a":{"5171":1,"5172":2,"5173":3,"5174":3,"5175":1,"5176":1,"5177":1,"5178":4,"5186":1,"5187":4,"5188":1,"5189":3,"5190":3,"5191":4}},{"p":"C17871","n":"Rudolf Rüegge","z":"Eingabe vor Eintritt","d":"2025-04-09","a":{"5171":4,"5172":3,"5173":1,"5174":2,"5175":1,"5176":1,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":4,"5188":4,"5189":4,"5190":4,"5191":3,"5192":2,"5193":1,"5194":2,"5195":2,"5196":1}},{"p":"C18068","n":"C18068","z":"Eingabe vor Eintritt","d":"2025-05-02","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":4,"5185":1,"5186":4,"5187":4,"5188":4,"5189":5,"5190":4,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C18269","n":"Peter Markus Ritzmann","z":"Eingabe vor Eintritt","d":"2025-05-19","a":{"5171":3,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":4,"5178":2,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":3,"5189":4,"5190":4,"5191":2,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C18276","n":"C18276","z":"Eingabe vor Eintritt","d":"2025-05-21","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":2,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":4,"5188":3,"5189":2,"5190":3,"5191":2,"5192":1,"5193":1,"5194":1,"5195":2,"5196":2}},{"p":"C18639","n":"C18639","z":"Eingabe vor Eintritt","d":"2025-06-18","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":4,"5178":3,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":4,"5188":3,"5189":3,"5190":3,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C18640","n":"C18640","z":"Eingabe vor Eintritt","d":"2025-06-19","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":3,"5189":3,"5190":3,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C18772","n":"Assefa Alemayehu","z":"Eingabe vor Eintritt","d":"2025-06-26","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":5,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C18919","n":"C18919","z":"Eingabe vor Eintritt","d":"2025-06-16","a":{"5171":5,"5172":3,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":2,"5187":4,"5188":3,"5189":3,"5190":3,"5191":2,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C20634","n":"Hartmann Friedrich Ammann","z":"Eingabe vor Eintritt","d":"2025-11-19","a":{"5171":5,"5172":3,"5173":1,"5174":2,"5175":1,"5176":1,"5177":1,"5178":1,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":2,"5187":5,"5188":3,"5189":5,"5190":4,"5191":4,"5192":1,"5193":1,"5194":2,"5195":2,"5196":1}},{"p":"C20634","n":"Hartmann Friedrich Ammann","z":"Nachkontrolle (3 Monate)","d":"2026-03-16","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":4,"5188":3,"5189":5,"5190":3,"5191":2,"5192":1,"5193":1,"5194":1,"5195":2,"5196":1}},{"p":"C20689","n":"Sjoerd Johannes Petrus Romkes","z":"Eingabe vor Eintritt","d":"2025-11-20","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C20689","n":"Sjoerd Johannes Petrus Romkes","z":"Nachkontrolle (3 Monate)","d":"2026-03-05","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":1,"5187":4,"5188":1,"5189":1,"5190":2,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C22022","n":"Hans-Jörg Hartmann","z":"Eingabe vor Eintritt","d":"2024-12-05","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":2,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":4,"5188":4,"5189":4,"5190":4,"5191":3,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C22118","n":"C22118","z":"Eingabe vor Eintritt","d":"2026-03-09","a":{"5171":5,"5172":4,"5173":1,"5174":2,"5175":1,"5176":1,"5177":2,"5178":3,"5179":2,"5180":3,"5181":2,"5182":3,"5183":1,"5184":1,"5185":2,"5186":4,"5187":4,"5188":4,"5189":5,"5190":4,"5191":1,"5192":2,"5193":1,"5194":3,"5195":4,"5196":2}},{"p":"C22192","n":"Herbert Sutter","z":"Eingabe vor Eintritt","d":"2024-12-22","a":{"5171":5,"5172":3,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":4,"5189":3,"5190":4,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C22218","n":"Alexander Fuchs","z":"Eingabe vor Eintritt","d":"2025-07-18","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":5,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C22219","n":"Max Bühler","z":"Eingabe vor Eintritt","d":"2025-07-09","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":5,"5188":4,"5189":5,"5190":3,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9856","n":"C9856","z":"Nachkontrolle (3 Monate)","d":"2023-01-24","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":3,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":4,"5189":3,"5190":4,"5191":3,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9856","n":"C9856","z":"Nachkontrolle (1 Jahr)","d":"2023-11-17","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":4,"5189":4,"5190":4,"5191":3,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9856","n":"C9856","z":"Nachkontrolle (3 Jahre)","d":"2025-01-06","a":{"5171":5,"5172":3,"5173":1,"5174":1,"5175":1,"5176":1,"5177":2,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":3,"5187":3,"5188":4,"5189":3,"5190":4,"5191":4,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9866","n":"C9866","z":"Nachkontrolle (1 Jahr)","d":"2023-02-07","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":4,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9866","n":"C9866","z":"Nachkontrolle (2 Jahre)","d":"2024-08-15","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9866","n":"C9866","z":"Nachkontrolle (3 Jahre)","d":"2025-06-05","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":5,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C9866","n":"C9866","z":"Nachkontrolle (4 Jahre)","d":"2026-03-16","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":4,"5187":5,"5188":4,"5189":5,"5190":5,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C11721","n":"C11721","z":"Nachkontrolle (6 Monate)","d":"2024-08-15","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":2,"5177":1,"5178":1,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":2,"5186":2,"5187":3,"5188":3,"5189":1,"5190":2,"5191":2,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C11721","n":"C11721","z":"Nachkontrolle (9 Monate)","d":"2025-01-06","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":2,"5177":1,"5178":2,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":1,"5186":2,"5187":3,"5188":2,"5189":1,"5190":2,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C11721","n":"C11721","z":"Nachkontrolle (1 Jahr)","d":"2025-03-13","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":1,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":1,"5185":2,"5186":2,"5187":3,"5188":2,"5190":2,"5191":2,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1,"EQ5D_101":0,"EQ5D_102":0,"EQ5D_103":0,"EQ5D_104":0,"EQ5D_105":0,"EQ5D_108":1,"EQ5D_109":1,"EQ5D_110":0,"EQ5D_111":3,"EQ5D_113":1,"EQ5D_114":0,"EQ5D_115":0}},{"p":"C11721","n":"C11721","z":"Nachkontrolle (2 Jahre)","d":"2026-03-16","a":{"5171":5,"5172":4,"5173":1,"5174":1,"5175":1,"5176":2,"5177":1,"5178":2,"5179":1,"5180":2,"5181":1,"5182":2,"5183":1,"5184":1,"5185":3,"5186":2,"5187":3,"5188":3,"5190":2,"5191":3,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1}},{"p":"C20597","n":"Jean Kramer","z":"Eingabe vor Eintritt","d":"2025-11-12","a":{"5171":5,"5172":3,"5173":1,"5174":2,"5175":1,"5176":1,"5177":1,"5178":2,"5179":1,"5180":1,"5181":1,"5182":1,"5183":1,"5184":2,"5185":1,"5186":4,"5187":3,"5188":3,"5189":3,"5190":3,"5191":1,"5192":1,"5193":1,"5194":1,"5195":1,"5196":1,"EQ5D_101":0,"EQ5D_102":0,"EQ5D_103":0,"EQ5D_104":1,"EQ5D_105":0,"EQ5D_108":1,"EQ5D_109":2,"EQ5D_110":1,"EQ5D_111":2,"EQ5D_112":0,"EQ5D_113":1,"EQ5D_114":1,"EQ5D_115":0}},{"p":"C20597","n":"Jean Kramer","z":"Nachkontrolle (3 Monate)","d":"2026-03-16","a":{"5171":4,"5172":3,"5173":1,"5174":2,"5175":2,"5176":1,"5177":2,"5178":2,"5179":2,"5180":1,"5181":1,"5182":1,"5183":1,"5184":2,"5185":1,"5186":3,"5187":3,"5188":3,"5189":3,"5190":3,"5191":1,"5192":1,"5193":1,"5194":1,"5195":2,"5196":1}}]};

const ZEITPUNKT_ORDER = [
  "Eingabe vor Eintritt",
  "Nachkontrolle (3 Monate)",
  "Nachkontrolle (6 Monate)",
  "Nachkontrolle (9 Monate)",
  "Nachkontrolle (1 Jahr)",
  "Nachkontrolle (2 Jahre)",
  "Nachkontrolle (3 Jahre)",
  "Nachkontrolle (4 Jahre)",
  "Nachkontrolle (5 Jahre)",
];

const ZEITPUNKT_SHORT = {
  "Eingabe vor Eintritt": "Prä-OP",
  "Nachkontrolle (3 Monate)": "3M",
  "Nachkontrolle (6 Monate)": "6M",
  "Nachkontrolle (9 Monate)": "9M",
  "Nachkontrolle (1 Jahr)": "1J",
  "Nachkontrolle (2 Jahre)": "2J",
  "Nachkontrolle (3 Jahre)": "3J",
  "Nachkontrolle (4 Jahre)": "4J",
  "Nachkontrolle (5 Jahre)": "5J",
};

const DOMAIN_COLORS = {
  "Harn": "#4A90D9",
  "Darm": "#7B68AE",
  "Sexual": "#D4A853",
  "Hormonal": "#C06C84",
  "EQ-5D": "#5B8C5A",
  "Lebensqualität": "#3D7B8A",
};

function toSeverity(score, scale) {
  if (score == null) return null;
  switch (scale) {
    case "problem": return (score - 1) / 4;
    case "freq_inv": return (5 - score) / 4;
    case "control_inv": return (4 - score) / 3;
    case "pads": return (score - 1) / 3;
    case "function_inv": return (5 - score) / 4;
    case "erection_qual": return (4 - score) / 3;
    case "erection_freq": return (5 - score) / 4;
    case "eq5d": return score / 4;
    case "lq": return score / 5;
    default: return null;
  }
}

function severityColor(sev) {
  if (sev == null) return "transparent";
  if (sev <= 0.05) return "#1a9641";
  if (sev <= 0.25) return "#72bf6a";
  if (sev <= 0.5) return "#f6d645";
  if (sev <= 0.75) return "#f28c3a";
  return "#d7191c";
}

function severityLabel(sev) {
  if (sev == null) return "—";
  if (sev <= 0.05) return "Gut";
  if (sev <= 0.25) return "Leicht";
  if (sev <= 0.5) return "Mässig";
  if (sev <= 0.75) return "Erhöht";
  return "Kritisch";
}

function parseExcel(wb) {
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
  const questions = INITIAL_DATA.q;

  const colMap = {};
  const headers = Object.keys(rows[0] || {});
  for (const q of questions) {
    for (const h of headers) {
      if (h.includes(`[${q.id}]`)) { colMap[q.id] = h; break; }
    }
  }

  const completedRows = rows.filter(r => {
    const status = r["PROM Status"];
    return status && String(status).includes("ausgefüllt");
  });

  const data = [];
  for (const row of completedRows) {
    const schluessel = row["PROM Schlüssel"];
    if (!schluessel) continue;
    const parts = String(schluessel).split("-");
    const pid = parts[parts.length - 1];
    const vn = row["Vorname (ID: 8005)"] || "";
    const nn = row["Nachname (ID: 8006)"] || "";
    const name = (String(vn).trim() + " " + String(nn).trim()).trim() || pid;
    const zeitpunkt = row["Erfassungszeitpunkt"] || "";
    const datum = row["PROM Ausfülldatum"] ? String(row["PROM Ausfülldatum"]).substring(0, 10) : "";

    const answers = {};
    for (const q of questions) {
      if (colMap[q.id]) {
        const val = row[colMap[q.id]];
        if (val != null) {
          const s = String(val);
          const m = s.match(/^\[(\d+)\]/);
          if (m) answers[q.id] = parseInt(m[1]);
          else if (!isNaN(parseFloat(s))) answers[q.id] = parseFloat(s);
        }
      }
    }
    data.push({ p: pid, n: name, z: zeitpunkt, d: datum, a: answers });
  }
  return data;
}

function Tooltip({ info, pos }) {
  if (!info) return null;
  return (
    <div style={{
      position: "fixed", left: pos.x + 12, top: pos.y - 8,
      background: "#1a1a2e", color: "#e0e0e0", padding: "10px 14px",
      borderRadius: 8, fontSize: 12, lineHeight: 1.5, zIndex: 999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)", maxWidth: 280,
      border: "1px solid rgba(255,255,255,0.1)",
      pointerEvents: "none",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{info.patient}</div>
      <div style={{ opacity: 0.7, marginBottom: 6 }}>{info.zeitpunkt} · {info.datum}</div>
      <div style={{ fontWeight: 600, color: info.color }}>{info.question}: {info.label}</div>
      <div style={{ opacity: 0.5, marginTop: 2 }}>Rohwert: {info.score}</div>
    </div>
  );
}

export default function PROMHeatmap() {
  const [data, setData] = useState(INITIAL_DATA.d);
  const [filter, setFilter] = useState("alle");
  const [domainFilter, setDomainFilter] = useState("alle");
  const [sortBy, setSortBy] = useState("name");
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [onlyConcerning, setOnlyConcerning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileRef = useRef(null);
  const questions = INITIAL_DATA.q;

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const newData = parseExcel(wb);
        if (newData.length > 0) {
          setData(newData);
        } else {
          alert("Keine ausgefüllten PROMs in der Datei gefunden.");
        }
      } catch (err) {
        alert("Fehler beim Lesen der Datei: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const domains = useMemo(() => [...new Set(questions.map(q => q.domain))], [questions]);

  const filteredQuestions = useMemo(() => {
    if (domainFilter === "alle") return questions;
    return questions.filter(q => q.domain === domainFilter);
  }, [questions, domainFilter]);

  const groupedByDomain = useMemo(() => {
    const groups = {};
    for (const q of filteredQuestions) {
      if (!groups[q.domain]) groups[q.domain] = [];
      groups[q.domain].push(q);
    }
    return groups;
  }, [filteredQuestions]);

  const patients = useMemo(() => {
    const map = {};
    for (const row of data) {
      if (!map[row.p]) map[row.p] = { id: row.p, name: row.n, rows: [] };
      map[row.p].rows.push(row);
    }
    for (const p of Object.values(map)) {
      p.rows.sort((a, b) => ZEITPUNKT_ORDER.indexOf(a.z) - ZEITPUNKT_ORDER.indexOf(b.z));
    }
    let list = Object.values(map);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term));
    }
    if (filter !== "alle") {
      list = list.filter(p => p.rows.some(r => r.z === filter));
    }
    if (onlyConcerning) {
      list = list.filter(p => {
        return p.rows.some(r => {
          return filteredQuestions.some(q => {
            const sev = toSeverity(r.a[q.id], q.scale);
            return sev !== null && sev > 0.5;
          });
        });
      });
    }
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "severity") {
      list.sort((a, b) => {
        const maxSev = (p) => {
          let mx = 0;
          for (const r of p.rows) {
            for (const q of filteredQuestions) {
              const s = toSeverity(r.a[q.id], q.scale);
              if (s !== null && s > mx) mx = s;
            }
          }
          return mx;
        };
        return maxSev(b) - maxSev(a);
      });
    }
    return list;
  }, [data, filter, domainFilter, sortBy, filteredQuestions, onlyConcerning, searchTerm]);

  const zeitpunkte = useMemo(() => {
    const set = new Set();
    for (const row of data) set.add(row.z);
    return ZEITPUNKT_ORDER.filter(z => set.has(z));
  }, [data]);

  const filteredZeitpunkte = useMemo(() => {
    if (filter === "alle") return zeitpunkte;
    return zeitpunkte.filter(z => z === filter);
  }, [zeitpunkte, filter]);

  const alertPatients = useMemo(() => {
    const alerts = [];
    for (const p of patients) {
      const latestRow = p.rows[p.rows.length - 1];
      const issues = [];
      for (const q of questions) {
        const sev = toSeverity(latestRow.a[q.id], q.scale);
        if (sev !== null && sev > 0.5) {
          issues.push({ question: q.short, domain: q.domain, severity: sev });
        }
      }
      if (issues.length > 0) {
        issues.sort((a, b) => b.severity - a.severity);
        alerts.push({ patient: p, issues, zeitpunkt: latestRow.z, datum: latestRow.d });
      }
    }
    alerts.sort((a, b) => b.issues[0].severity - a.issues[0].severity);
    return alerts;
  }, [patients, questions]);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0d1117", color: "#c9d1d9", minHeight: "100vh", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f0f3f6", margin: 0, letterSpacing: "-0.5px" }}>
              PROM Heatmap · Urologie
            </h1>
            <p style={{ fontSize: 13, opacity: 0.5, margin: "6px 0 0" }}>
              {data.length} Befragungen · {patients.length} Patienten · Prostatektomie
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => fileRef.current?.click()} style={{
              background: "#238636", color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>+</span> Neue Daten laden (.xlsx)
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
          </div>
        </div>

        {alertPatients.length > 0 && (
          <div style={{ background: "rgba(215,25,28,0.08)", border: "1px solid rgba(215,25,28,0.25)", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f85149", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚠</span> Handlungsbedarf: {alertPatients.length} Patient{alertPatients.length > 1 ? "en" : ""} mit besorgniserregenden Werten
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {alertPatients.slice(0, 8).map((a, i) => (
                <div key={i} style={{
                  background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px",
                  fontSize: 12, minWidth: 180, flex: "1 1 220px", maxWidth: 300,
                }}>
                  <div style={{ fontWeight: 600, color: "#f0f3f6", marginBottom: 4 }}>{a.patient.name}</div>
                  <div style={{ opacity: 0.5, marginBottom: 6 }}>{ZEITPUNKT_SHORT[a.zeitpunkt] || a.zeitpunkt} · {a.datum}</div>
                  {a.issues.slice(0, 3).map((iss, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: severityColor(iss.severity), flexShrink: 0,
                      }} />
                      <span style={{ color: DOMAIN_COLORS[iss.domain], fontWeight: 500 }}>{iss.domain}</span>
                      <span style={{ opacity: 0.7 }}>· {iss.question}</span>
                    </div>
                  ))}
                  {a.issues.length > 3 && <div style={{ opacity: 0.4, marginTop: 2 }}>+{a.issues.length - 3} weitere</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text" placeholder="Patient suchen..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: "#161b22", border: "1px solid #30363d", borderRadius: 8,
              padding: "8px 12px", color: "#c9d1d9", fontSize: 13, width: 180,
              outline: "none",
            }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={selectStyle}>
            <option value="alle">Alle Zeitpunkte</option>
            {zeitpunkte.map(z => <option key={z} value={z}>{ZEITPUNKT_SHORT[z] || z}</option>)}
          </select>
          <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} style={selectStyle}>
            <option value="alle">Alle Domänen</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
            <option value="name">Sortierung: Name</option>
            <option value="severity">Sortierung: Schweregrad</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={onlyConcerning} onChange={e => setOnlyConcerning(e.target.checked)}
              style={{ accentColor: "#d7191c" }} />
            Nur besorgniserregend
          </label>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { color: "#1a9641", label: "Gut" },
            { color: "#72bf6a", label: "Leicht" },
            { color: "#f6d645", label: "Mässig" },
            { color: "#f28c3a", label: "Erhöht" },
            { color: "#d7191c", label: "Kritisch" },
            { color: "transparent", label: "Keine Daten", border: true },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                background: l.color,
                border: l.border ? "1px dashed #30363d" : "none",
              }} />
              {l.label}
            </div>
          ))}
        </div>

        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #21262d" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 160, minWidth: 130, position: "sticky", left: 0, zIndex: 3, background: "#0d1117" }}>Patient</th>
                <th style={{ ...thStyle, width: 60, minWidth: 50, position: "sticky", left: 130, zIndex: 3, background: "#0d1117" }}>Zeitpunkt</th>
                {Object.entries(groupedByDomain).map(([domain, qs]) => (
                  <th key={domain} colSpan={qs.length} style={{
                    ...thStyle, textAlign: "center",
                    color: DOMAIN_COLORS[domain], fontWeight: 700, fontSize: 12,
                    borderBottom: `2px solid ${DOMAIN_COLORS[domain]}`,
                  }}>
                    {domain}
                  </th>
                ))}
              </tr>
              <tr>
                <th style={{ ...thStyle, position: "sticky", left: 0, zIndex: 3, background: "#0d1117" }}></th>
                <th style={{ ...thStyle, position: "sticky", left: 130, zIndex: 3, background: "#0d1117" }}></th>
                {filteredQuestions.map(q => (
                  <th key={q.id} style={{
                    ...thStyle, fontSize: 9, fontWeight: 500,
                    writingMode: "vertical-lr", textOrientation: "mixed",
                    height: 120, padding: "6px 3px", maxWidth: 28, minWidth: 28,
                    color: DOMAIN_COLORS[q.domain], opacity: 0.8,
                  }}>
                    {q.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => {
                const rowsToShow = filter === "alle" ? patient.rows : patient.rows.filter(r => r.z === filter);
                return rowsToShow.map((row, ri) => (
                  <tr key={`${patient.id}-${ri}`} style={{ borderTop: ri === 0 ? "1px solid #21262d" : "none" }}>
                    {ri === 0 && (
                      <td rowSpan={rowsToShow.length} style={{
                        ...tdStyle, fontWeight: 600, color: "#f0f3f6", fontSize: 12,
                        position: "sticky", left: 0, zIndex: 2, background: "#0d1117",
                        borderRight: "1px solid #21262d", maxWidth: 140,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {patient.name}
                      </td>
                    )}
                    <td style={{
                      ...tdStyle, fontSize: 10, opacity: 0.7, whiteSpace: "nowrap",
                      position: "sticky", left: 130, zIndex: 2, background: "#0d1117",
                      borderRight: "1px solid #21262d",
                    }}>
                      {ZEITPUNKT_SHORT[row.z] || row.z}
                    </td>
                    {filteredQuestions.map(q => {
                      const score = row.a[q.id];
                      const sev = toSeverity(score, q.scale);
                      const color = severityColor(sev);
                      const label = severityLabel(sev);
                      return (
                        <td key={q.id} style={{
                          ...tdStyle, padding: 2, textAlign: "center",
                        }}
                          onMouseEnter={(e) => {
                            setTooltip({
                              patient: patient.name, zeitpunkt: row.z, datum: row.d,
                              question: q.short, score, label, color,
                            });
                            setTooltipPos({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: 4, margin: "0 auto",
                            background: sev !== null ? color : "transparent",
                            border: sev === null ? "1px dashed #21262d" : "none",
                            opacity: sev !== null ? 1 : 0.3,
                            transition: "transform 0.15s",
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.3)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, opacity: 0.4, fontSize: 14 }}>
            Keine Patienten gefunden. Passen Sie die Filter an oder laden Sie neue Daten.
          </div>
        )}

        <div style={{ marginTop: 24, padding: "16px 20px", background: "#161b22", borderRadius: 10, border: "1px solid #21262d", fontSize: 12, lineHeight: 1.7, opacity: 0.6 }}>
          <strong style={{ opacity: 1 }}>Hinweis zur Interpretation:</strong> Die Farbcodierung normalisiert unterschiedliche Skalen auf eine einheitliche Schweregrad-Skala. 
          Für «Problem»-Fragen (1–5) steht 1 für «kein Problem» (grün) und 5 für «grosses Problem» (rot). 
          Für «Funktions»-Fragen (Erektion, Orgasmus etc.) ist die Skala invertiert: 5 = «sehr gut» (grün), 1 = «sehr schlecht» (rot).
          EQ-5D und Lebensqualitätsfragen: 0 = ausgezeichnet (grün), höhere Werte = schlechter.
          Hovern Sie über eine Zelle für Details.
        </div>
      </div>

      <Tooltip info={tooltip} pos={tooltipPos} />
    </div>
  );
}

const selectStyle = {
  background: "#161b22", border: "1px solid #30363d", borderRadius: 8,
  padding: "8px 12px", color: "#c9d1d9", fontSize: 13, outline: "none",
  cursor: "pointer",
};

const thStyle = {
  padding: "8px 6px", textAlign: "left", background: "#0d1117",
  borderBottom: "1px solid #21262d", color: "#8b949e", fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "4px 6px", borderBottom: "1px solid rgba(33,38,45,0.5)",
};
