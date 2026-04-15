#include <bits/stdc++.h>
using namespace std;

namespace {
constexpr long long MOD = 1'000'000'007LL;

long long mod_pow(long long base, long long exp) {
    long long result = 1LL;
    base %= MOD;
    while (exp > 0) {
        if (exp & 1LL) {
            result = (result * base) % MOD;
        }
        base = (base * base) % MOD;
        exp >>= 1LL;
    }
    return result;
}
}  // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    cin >> n;
    vector<long long> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    sort(a.begin(), a.end());

    vector<long long> fact(n + 1, 1LL);
    vector<long long> inv_fact(n + 1, 1LL);
    for (int i = 1; i <= n; ++i) {
        fact[i] = (fact[i - 1] * i) % MOD;
    }
    inv_fact[n] = mod_pow(fact[n], MOD - 2);
    for (int i = n - 1; i >= 0; --i) {
        inv_fact[i] = (inv_fact[i + 1] * (i + 1)) % MOD;
    }

    auto comb = [&](int nn, int kk) -> long long {
        if (kk < 0 || kk > nn) {
            return 0LL;
        }
        return (((fact[nn] * inv_fact[kk]) % MOD) * inv_fact[nn - kk]) % MOD;
    };

    long long answer = 1LL;
    int processed = 0;

    for (int i = 0; i < n;) {
        int j = i;
        while (j < n && a[j] == a[i]) {
            ++j;
        }
        const int run = j - i;

        // H(run) = product_{k=2..run} C(k,2)
        for (int k = 2; k <= run; ++k) {
            answer = (answer * comb(k, 2)) % MOD;
        }

        processed += run;
        if (i > 0) {
            answer = (answer * comb(processed, run - 1)) % MOD;
        }

        i = j;
    }

    cout << answer << '\n';
    return 0;
}
